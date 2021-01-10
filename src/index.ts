import express from 'express';
import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Worker } from 'worker_threads';

// レスポンスするJSONのオブジェクト
let resJSON: any;

// Express.js を使用する
const app: express.Express = express();
// config.yaml から設定を読み込む
// const config: any = yaml.load(fs.readFileSync('./config.yaml').toString('utf-8'));

// 扱うタイムゾーン
const timezones: Array<string> = ['Asia/Tokyo', 'Asia/Ulaanbaatar', 'Asia/Bangkok'];

const router: express.Router = express.Router();

// [GET] /
router.get('/', (req: express.Request, res: express.Response) => {
    console.log(`|GET| ${req.url} <- ${req.ip}`);

    res.status(200);
    res.send(`TCJ2 Kadai Store API - v${process.env.npm_package_version}`);
});

// [GET] /version
router.get('/version', (req: express.Request, res: express.Response) => {
    console.log(`|GET| ${req.url} <- ${req.ip}`);

    res.status(200);
    res.send(`TCJ2 Kadai Store API - v${process.env.npm_package_version}`);
});

// [GET] /get
router.get('/get', (req: express.Request, res: express.Response) => {
    console.log(`|GET| ${req.url} <- ${req.ip}`);

    // 一度でもスクレイピングしたなら、JSONを返す
    if (resJSON !== undefined) {
        // URLクエリパラメータ "due" "timezone" を取得
        // 指定されていなかったら、空の文字列を渡す
        let due: string = req.query.due == undefined ? '' : req.query.due as string;
        let timezone: string = req.query.timezone === undefined ? '' : req.query.timezone as string;

        let index: number = timezones.indexOf(timezone);

        res.status(200);
        res.header('Content-Type', 'application/json; charset=utf-8');

        if (due === 'future' && index !== -1) {
            // 提出期限が未来の課題情報で、タイムゾーン指定があるなら
            res.send(
                JSON.stringify(resJSON.future[index+1])
            );
        } else if (due === 'future') {
            // 提出期限が未来の課題情報で、不正なタイムゾーンまたはタイムゾーン指定がなければ
            res.send(
                JSON.stringify(resJSON.future[0])
            );
        } else if (index !== -1) {
            // タイムゾーン指定があるなら
            res.send(
                JSON.stringify(resJSON.all[index+1])
            );
        } else {
            // 不正なタイムゾーンまたはタイムゾーン指定がなければ
            res.send(
                JSON.stringify(resJSON.all[0])
            );
        }
    } else {
        res.status(503);
        res.send('503 Service Unavailable');
    }
});

// [GET] 404 Not Found
router.get('*', (req: express.Request, res: express.Response) => {
    console.log(`|GET| ${req.url} <- ${req.ip}`);

    res.status(404);
    res.send('404 Not Found');
})

// [POST] 404 Not Found
router.post('*', (req: express.Request, res: express.Response) => {
    console.log(`|POST| ${req.url} <- ${req.ip}`);

    res.status(404);
    res.send('404 Not Found');
})

// APIサーバーの提供を開始
app.use(router);
app.listen(8080, () => {
    console.log("ポート8080で開始しました。");
});

// マルチスレッドでスクレイピング(devoirs-core)を動かす
const task: Worker = new Worker(
    path.resolve(__dirname, './worker.js'),
    {
        workerData: {
            path:      './scraping.ts',
            timezones: timezones
        }
    }
);
// スクレイピングされたら、JSON文字列に変換して標準出力
task.on('message', (mes) => {
    resJSON = mes.value;
    console.log('MS Teamsから課題情報を取得しました。');
})