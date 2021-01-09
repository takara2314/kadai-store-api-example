import * as devoirs from 'devoirs-core';
import { isMainThread, parentPort, workerData } from 'worker_threads';
import fs from 'fs-extra';
import * as moment from 'moment-timezone';
import { Assignment, ScrapingData, ScrapingDatas } from './models';

// メインスレッドで実行されているなら
if (isMainThread) {
    throw new Error('メインスレッドで実行しないでください。');
}

// devoirs-core でスクレイピングを行う関数
const scraping = () => {
    // devoirs-core の一時データを削除
    fs.removeSync('./data');

    // Puppeteer (Headless Chrome) を使用
    const chromium: devoirs.Chromium = devoirs.createChromium({
        dataDirPath: './data'
    });

    // Microsoft のアカウントで認証
    const authorizer: devoirs.AutomaticAuthorizer = new devoirs.AutomaticAuthorizer(
        chromium,
        process.env.MICROSOFT_EMAIL!,
        process.env.MICROSOFT_PASSWORD!,
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
        let kadaiInfos: Array<Assignment> = [];
        // 期限が未来の課題情報
        let kadaiInfosFuture: Array<Assignment> = [];

        for (const course of await client.getClasses()) {
            for (const assignment of await client.getAssignments(course.id)) {
                // 課題情報
                const kadaiInfo: Assignment = {
                    course:     course.name,
                    subject:    course.name,
                    subject_id: course.name,
                    name:       assignment.displayName,
                    id:         assignment.id,
                    due:        moment.default(assignment.dueDateTime).tz('Etc/UTC').toDate()
                };
                kadaiInfos.push(kadaiInfo);

                // 提出期限が未来のものなら
                const nowTime: moment.Moment = moment.default().tz('Etc/UTC');
                if (moment.default(assignment.dueDateTime).isAfter(nowTime)) {
                    // 課題情報
                    const kadaiInfoFuture: Assignment = {
                        course:     course.name,
                        subject:    course.name,
                        subject_id: course.name,
                        name:       assignment.displayName,
                        id:         assignment.id,
                        due:        moment.default(assignment.dueDateTime).tz('Etc/UTC').toDate()
                    };
                    kadaiInfosFuture.push(kadaiInfoFuture);
                }
            }
        }

        // 全ての課題の情報が載っている、スクレイピング情報
        let kadaiDataUTC: ScrapingData = {
            acquisition: moment.default().tz('Etc/UTC').toDate(),
            assignments: kadaiInfos
        }
        // 提出期限が未来の課題の情報が載っている、スクレイピング情報
        let kadaiDataUTCFuture: ScrapingData = {
            acquisition: moment.default().tz('Etc/UTC').toDate(),
            assignments: kadaiInfosFuture
        }

        let jsonDataAll: Array<ScrapingData> = [];
        let jsonDataFuture: Array<ScrapingData> = [];

        // 扱うタイムゾーンの分だけ、そのタイムゾーンに合わせて複製
        for (let timezone in workerData.timezones) {
            jsonDataAll.push(kadaiDataUTC);
            jsonDataFuture.push(kadaiDataUTCFuture);
            // ↓ 次のコミットで実装 ↓
            // jsonDataAll.push(
            //     timeConv(kadaiDataUTC, timezone)
            // );
            // jsonDataFuture.push(
            //     timeConv(kadaiDataUTCFuture, timezone)
            // );
        }

        // レスポンスするJSONのデータ
        let jsonData: ScrapingDatas = {
            all:    jsonDataAll,
            future: jsonDataFuture
        }

        // index.ts へ課題情報オブジェクトを返す
        parentPort!.postMessage({
            value: jsonData
        });
    })().catch(console.error);
};

// 1分(60秒)ごとにスクレイピングする
// setInterval は実行してから1分後に、初めてscraping関数を呼び出すので、
// 最初の一回は自分で呼び出す
scraping();
setInterval(scraping, 60000);