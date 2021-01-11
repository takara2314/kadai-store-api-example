import express from 'express';
import { config, resJSON } from './index';
import { provide } from './provide';

export const apiServer = () => {
    // Express.js を使用する
    const app: express.Express = express();
    const router: express.Router = express.Router();

    // API利用回数の制限を設けているなら
    const isGetLimit: boolean = config.get_limit > -1 ? true : false;

    // トークンごとに、指定した期間内のAPI利用可能回数を記録
    const getCount: number[] = new Array(
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

        if (index !== -1 && (getCount[index] > 0 || !isGetLimit)) {
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