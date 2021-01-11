import fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { apiServer } from './server';
import { ScrapingDatas } from './models';

// api-config.yaml から設定を読み込む
export const config: any = yaml.load(fs.readFileSync('./api-config.yaml').toString('utf-8'));
// レスポンスするJSONのオブジェクト
export let resJSON: ScrapingDatas;

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
            subjects:        config.subjects,
            update_duration: config.update_duration,
            update_offtimes: config.update_offtimes
        }
    }
);

// スクレイピングされたら、JSON文字列に変換して標準出力
task.on('message', (mes) => {
    resJSON = mes.value;
    console.log('MS Teamsから課題情報を取得しました。');
})