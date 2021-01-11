import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { apiServer } from './server';

// api-config.yaml から設定を読み込む
export const config: any = yaml.load(fs.readFileSync('./api-config.yaml').toString('utf-8'));
// レスポンスするJSONのオブジェクト
export let resJSON: any;

// APIサーバーを起動
apiServer();

// マルチスレッドでスクレイピング(devoirs-core)を動かす
const task: Worker = new Worker(
    path.resolve(__dirname, './worker.js'),
    {
        workerData: {
            path:            './scraping.ts',
            tmp_dir:         config['tmp-dir'],
            timezones:       config.timezones,
            update_duration: config.update_duration,
            subjects:        config.subjects
        }
    }
);

// スクレイピングされたら、JSON文字列に変換して標準出力
task.on('message', (mes) => {
    resJSON = mes.value;
    console.log('MS Teamsから課題情報を取得しました。');
})