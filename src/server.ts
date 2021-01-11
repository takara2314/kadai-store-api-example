import express from 'express';
import { config, resJSON } from './index';

export const apiServer = () => {
    // Express.js を使用する
    const app: express.Express = express();
    const router: express.Router = express.Router();

    // API利用回数の制限を設けているなら
    const isGetLimit: boolean = config['allow-tokens'].length > -1 ? true : false;

    // トークンごとに、指定した期間内のAPI利用可能回数を記録
    const getCount: Array<number> = new Array(
        config['allow-tokens'].length
    ).fill(config.get_limit as number);

    // 指定した期間後になったら、API利用可能回数をリセット
    setInterval(() => {
        getCount.fill(config.get_limit as number);
    }, (config.get_limit_duration as number) * 60000);

    // 指定した期間が経過すれば、API利用可能回数をリセットする
    if (config.get_limit_duration > 1) {
        setInterval(() => {
            console.log('更新しました。');
            getCount.fill(config.get_limit as number);
        }, config.get_limit_duration * 60000);
    }

    // [GET] /
    router.get('/', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);
        console.log('-> 200 OK');

        res.status(200);
        res.send(`Kadai Store API - v${process.env.npm_package_version}`);
    });

    // [GET] /version
    router.get('/version', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);
        console.log('-> 200 OK');

        res.status(200);
        res.send(`Kadai Store API - v${process.env.npm_package_version}`);
    });

    // [GET] /get
    router.get('/get', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);

        // ヘッダー "Authorization" を取得
        let auth: string = req.header('Authorization') === undefined ? '' : req.header('Authorization') as string;
        console.log(`(Authorization: ${auth})`);

        // トークン部分が allow-tokens になければ、結果的に不許可
        let index: number = config['allow-tokens']
            .indexOf(auth.slice(7));
        // スキームが Bearer でなければ、結果的に不許可
        if (auth.slice(0, 6) !== 'Bearer') {
            index = -1;
        }

        if (index !== -1 && getCount[index] > 0) {
            // トークン部分が allow-tokens にあるのと一致すれば
            provide(req, res);

            if (isGetLimit) {
                getCount[index]--;
            }
        } else if (index !== -1) {
            console.log('-> 429 Too Many Requests');
            res.status(429);
            res.send('429 Too Many Requests');
        } else {
            console.log('-> 401 Unauthorized');
            res.status(401);
            res.send('401 Unauthorized');
        }
    });

    // [GET] 404 Not Found
    router.get('*', (req: express.Request, res: express.Response) => {
        console.log(`|GET| ${req.url} <- ${req.ip}`);
        console.log('-> 404 Not Found');

        res.status(404);
        res.send('404 Not Found');
    });

    // [POST] 404 Not Found
    router.post('*', (req: express.Request, res: express.Response) => {
        console.log(`|POST| ${req.url} <- ${req.ip}`);
        console.log('-> 404 Not Found');

        res.status(404);
        res.send('404 Not Found');
    })

    app.use(router);

    // APIサーバーの提供を開始
    app.listen(8080, () => {
        console.log("ポート8080で開始しました。");
    });
}

// /get にアクセスされ、正しく認証されて、制限に引っかかっていないときの処理
const provide = (req: express.Request, res: express.Response) => {
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
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: 未来の課題のみ取得、${timezone}`);
            res.send(
                JSON.stringify(resJSON.future[index+1])
            );
        } else if (due === 'future') {
            // 提出期限が未来の課題情報で、不正なタイムゾーンまたはタイムゾーン指定がなければ
            console.log('-> 200 OK');
            console.log('-> 有効な指定: 未来の課題のみ取得');
            res.send(
                JSON.stringify(resJSON.future[0])
            );
        } else if (index !== -1) {
            // タイムゾーン指定があるなら
            console.log('-> 200 OK');
            console.log(`-> 有効な指定: ${timezone}`);
            res.send(
                JSON.stringify(resJSON.all[index+1])
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