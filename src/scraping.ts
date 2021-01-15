import fs from 'fs-extra';
import os from 'os';
import * as devoirs from 'devoirs-core';
import * as moment from 'moment-timezone';
import { isMainThread, parentPort, workerData } from 'worker_threads';
import { Assignment, ScrapingData, ScrapingDatas } from './models';
import { infoTimeConv } from './convert';

// メインスレッドで実行されているなら
if (isMainThread) {
    throw new Error('メインスレッドで実行しないでください。');
}

// devoirs-core でスクレイピングを行う関数
const scraping = () => {
    // 現在時刻が、課題情報を取得しない時間であれば、処理を中止
    if (
        workerData.update_offtimes.includes(moment.default().hour())
        && workerData.update_offtimes.length !== 0
    ) { return; }

    // 一時フォルダ
    const tmp_dir: string = workerData.tmp_dir === null ? `${os.tmpdir()}/api-data` : workerData.tmp_dir;

    // devoirs-core の一時データを削除
    fs.removeSync(tmp_dir);

    // Puppeteer (Headless Chrome) を使用
    const chromium: devoirs.Chromium = devoirs.createChromium({
        dataDirPath: tmp_dir
    });

    // Microsoft のアカウントで認証
    const authorizer: devoirs.AutomaticAuthorizer = new devoirs.AutomaticAuthorizer(
        chromium,
        process.env.MICROSOFT_EMAIL!,
        process.env.MICROSOFT_PASSWORD!
    );

    // Microsoft からトークンを取得
    let token: any = null;
    const tokenProvider = {
        get() {
            return token ? Promise.resolve(token) : this.refresh();
        },
        async refresh() {
            return token = await authorizer.authorize();
        }
    };

    // スクレイピングを行うクライアント
    const client: devoirs.ApiClient = devoirs.createDevoirsClient({
        tokenProvider
    });

    (async () => {
        // 全ての課題情報
        let kadaiInfos: Assignment[] = Array();
        // 期限が未来の課題情報
        let kadaiInfosFuture: Assignment[] = Array();

        // 扱うチーム名
        let teamNames: string[] = workerData.subjects.map(
            (name: string[]): string => {
                return name[0];
        });

        for (const course of await client.getClasses()) {
            for (const assignment of await client.getAssignments(course.id)) {
                let index: number = teamNames.indexOf(course.name);

                // 課題情報
                const kadaiInfo: Assignment = {
                    course:     course.name,
                    subject:    (index !== -1) ? workerData.subjects[index][1] : 'unknown',
                    subject_id: (index !== -1) ? workerData.subjects[index][2] : 'unknown',
                    name:       assignment.displayName,
                    id:         assignment.id,
                    due:        moment.default(assignment.dueDateTime).tz('Etc/UTC').format()
                };
                kadaiInfos.push(kadaiInfo);

                // 提出期限が未来のものなら
                const nowTime: moment.Moment = moment.default().tz('Etc/UTC');
                if (moment.default(assignment.dueDateTime).isAfter(nowTime)) {
                    // 課題情報
                    const kadaiInfoFuture: Assignment = {
                        course:     course.name,
                        subject:    (index !== -1) ? workerData.subjects[index][1] : 'unknown',
                        subject_id: (index !== -1) ? workerData.subjects[index][2] : 'unknown',
                        name:       assignment.displayName,
                        id:         assignment.id,
                        due:        moment.default(assignment.dueDateTime).tz('Etc/UTC').format()
                    };
                    kadaiInfosFuture.push(kadaiInfoFuture);
                }
            }
        }

        // 全ての課題の情報が載っている、スクレイピング情報
        let kadaiDataUTC: ScrapingData = {
            acquisition: moment.default().tz('Etc/UTC').format(),
            assignments: kadaiInfos
        };
        // 提出期限が未来の課題の情報が載っている、スクレイピング情報
        let kadaiDataUTCFuture: ScrapingData = {
            acquisition: moment.default().tz('Etc/UTC').format(),
            assignments: kadaiInfosFuture
        };

        let jsonDataAll: ScrapingData[] = Array();
        let jsonDataFuture: ScrapingData[] = Array();

        jsonDataAll.push(kadaiDataUTC);
        jsonDataFuture.push(kadaiDataUTCFuture);
        // 扱うタイムゾーンの分だけ、そのタイムゾーンに合わせて複製
        for (let timezone of workerData.timezones) {
            jsonDataAll.push(
                infoTimeConv(kadaiDataUTC, timezone)
            );
            jsonDataFuture.push(
                infoTimeConv(kadaiDataUTCFuture, timezone)
            );
        }

        // レスポンスするJSONのデータ
        let jsonData: ScrapingDatas = {
            all:    jsonDataAll,
            future: jsonDataFuture
        };

        // index.ts へ課題情報オブジェクトを返す
        parentPort!.postMessage({
            value: jsonData
        });
    })().catch(console.error);
};

// 指定した期間後ごとにスクレイピングする
// setInterval は実行してから指定した期間後に、初めてscraping関数を呼び出すので、
// 最初の一回は自分で呼び出す
scraping();
setInterval(scraping, workerData.update_duration * 60000);