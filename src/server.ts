import express from 'express';
import { config, resJSON } from './index';

export const apiServer = () => {
    // Express.js を使用する
    const app: express.Express = express();
    const router: express.Router = express.Router();

    // [GET] /
    router.get('/', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);

        res.status(200);
        res.send(`Kadai Store API - v${process.env.npm_package_version}`);
    });

    // [GET] /version
    router.get('/version', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);

        res.status(200);
        res.send(`Kadai Store API - v${process.env.npm_package_version}`);
    });

    // [GET] /get
    router.get('/get', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);

        getAccess(req, res);
    });

    // [GET] 404 Not Found
    router.get('*', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);

        res.status(404);
        res.send('404 Not Found');
    });

    // [POST] 404 Not Found
    router.post('*', (req: express.Request, res: express.Response) => {
        console.log(`|POST| ${req.url} <- ${req.ip}`);

        res.status(404);
        res.send('404 Not Found');
    })

    app.use(router);

    // APIサーバーの提供を開始
    app.listen(8080, () => {
        console.log("ポート8080で開始しました。");
    });
}

// /get にアクセスされたときの処理
const getAccess = (req: express.Request, res: express.Response) => {
    // 一度でもスクレイピングしたなら、JSONを返す
    if (resJSON !== undefined) {
        // URLクエリパラメータ "due" "timezone" を取得
        // 指定されていなかったら、空の文字列を渡す
        let due: string = req.query.due == undefined ? '' : req.query.due as string;
        let timezone: string = req.query.timezone === undefined ? '' : req.query.timezone as string;

        let index: number = config.timezones.indexOf(timezone);

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
};