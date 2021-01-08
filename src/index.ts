import express from 'express';
import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Worker } from 'worker_threads';

// レスポンスするJSON
let resJSON: string = '{"acquisition": "2020-04-01T00:00:00.000Z", "assignments": []}'

// Express.js を使用する
const app: express.Express = express();
// config.yaml から設定を読み込む
// const config: any = yaml.load(fs.readFileSync('./config.yaml').toString('utf-8'));

const router: express.Router = express.Router();
// [GET] /
router.get('/', (req: express.Request, res: express.Response) => {
    console.log(`|GET| / << ${req.ip}`);
    res.status(200);
    res.send(`TCJ2 Kadai Store API - v${process.env.npm_package_version}`);
});
// [GET] /version
router.get('/version', (req: express.Request, res: express.Response) => {
    console.log(`|GET| /version << ${req.ip}`);
    res.status(200);
    res.send(`TCJ2 Kadai Store API - v${process.env.npm_package_version}`);
});
// [GET] /get
router.get('/get', (req: express.Request, res: express.Response) => {
    console.log(`|GET| /get << ${req.ip}`);
    res.status(200);
    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send(resJSON);
});
// [GET] 404 Not Found
router.get('*', (req: express.Request, res: express.Response) => {
    res.status(404);
    res.send('404 Not Found');
})
// [POST] 404 Not Found
router.post('*', (req: express.Request, res: express.Response) => {
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
            path: './scraping.ts'
        }
    }
);
// スクレイピングされたら、JSON文字列に変換して標準出力
task.on('message', (mes) => {
    // console.log(JSON.stringify(mes.value));
    resJSON = JSON.stringify(mes.value);
})