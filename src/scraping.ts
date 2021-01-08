import * as devoirs from 'devoirs-core';
import { isMainThread, parentPort } from 'worker_threads';
import fs from 'fs-extra';

const scraping = () => {
    parentPort!.postMessage({
        value: '{"greeting": "hogehoge"}'
    });
};

// 1分(60秒)ごとにスクレイピングする
// setInterval は実行してから1分後に、初めてscraping関数を呼び出すので、
// 最初の一回は自分で呼び出す
scraping();
setInterval(scraping, 60000);