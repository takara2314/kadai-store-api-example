const path = require('path');
const { workerData } = require('worker_threads');

// ts-node で指定された worker ファイルを実行
require('ts-node').register();
require(path.resolve(__dirname, workerData.path));