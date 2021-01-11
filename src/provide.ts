import express from 'express';
import { config, resJSON } from './index';
import { query } from './query';

// /get にアクセスされ、正しく認証されて、制限に引っかかっていないときの処理
export const provide = (req: express.Request, res: express.Response) => {
    // 一度でもスクレイピングしたなら、JSONを返す
    if (resJSON !== undefined) {
        // URLクエリパラメータ "due" "timezone" "subject" を取得
        // 指定されていなかったら、空の文字列を渡す
        const due: string = req.query.due == undefined ? '' : req.query.due as string;
        const timezone: string = req.query.timezone === undefined ? '' : req.query.timezone as string;
        const subjectParam: string[] = req.query.subject === undefined ? Array() : (req.query.subject as string).split(',');

        // 対応している教科ID
        const subjectIDs: string[] = config.subjects.map(
            (name: string[]): string => {
                return name[2];
        });

        // クエリ対象の教科ID
        let subjects: string[] = Array();
        for (let subjectID of subjectIDs) {
            if (subjectParam.includes(subjectID)) {
                subjects.push(subjectID);
            }
        }
        // 重複削除
        subjects = Array.from(new Set(subjects));

        let index: number = config.timezones.indexOf(timezone);

        res.status(200);
        res.header('Content-Type', 'application/json; charset=utf-8');

        if (due === 'future' && index !== -1 && subjects.length > 0) {
            // 提出期限が未来の課題情報で、タイムゾーン指定、教科指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: 未来の課題のみ取得、${timezone}、${subjects}のみ`);
            res.send(
                JSON.stringify(query(resJSON.future[index+1], subjects))
            );
        } else if (due === 'future' && index !== -1) {
            // 提出期限が未来の課題情報で、タイムゾーン指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: 未来の課題のみ取得、${timezone}`);
            res.send(
                JSON.stringify(resJSON.future[index+1])
            );
        } else if (due === 'future' && subjects.length > 0) {
            // 提出期限が未来の課題情報で、教科指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: 未来の課題のみ取得、${subjects}のみ`);
            res.send(
                JSON.stringify(query(resJSON.future[0], subjects))
            );
        } else if (due === 'future') {
            // 提出期限が未来の課題情報で、不正なタイムゾーンまたはタイムゾーン指定がなければ
            console.log('-> 200 OK');
            console.log('-> 有効な指定: 未来の課題のみ取得');
            res.send(
                JSON.stringify(resJSON.future[0])
            );
        } else if (index !== -1 && subjects.length > 0) {
            // タイムゾーン指定、教科指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: ${timezone}、${subjects}のみ`);
            res.send(
                JSON.stringify(query(resJSON.all[index+1], subjects))
            );
        } else if (index !== -1) {
            // タイムゾーン指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: ${timezone}`);
            res.send(
                JSON.stringify(resJSON.all[index+1])
            );
        } else if (subjects.length > 0) {
            // 教科指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: ${subjects}のみ`);
            res.send(
                JSON.stringify(query(resJSON.all[index+1], subjects))
            );
        } else {
            // 不正なタイムゾーンまたはタイムゾーン指定がなければ
            console.log('-> 200 OK');
            console.log('-> 有効な指定: なし');
            res.send(
                JSON.stringify(resJSON.all[0])
            );
        }
    } else {
        console.log('-> 503 Service Unavailable');
        console.log('-> まだスクレイピングが完了していません。');
        res.status(503);
        res.send('Sorry, this service is preparing.');
    }
};