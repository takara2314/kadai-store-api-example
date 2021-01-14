// コンパイルされた index.js の中で呼び出すワーカーファイルの拡張子を .js にする

const fs = require('fs');
const target = './dist/index.js';

if (fs.existsSync('./dist') && fs.existsSync(target)) {
    let text = fs.readFileSync(target, 'utf-8');

    text = text.replace('worker.js', 'scraping.js')
            .replace('        path: \'./scraping.ts\',', '');

    fs.writeFileSync(target, text, (err) => {
        if (err) throw err;
    })
    console.log('運用する準備ができました。お疲れ様でした。');

} else if (fs.existsSync('./node_modules')) {
    console.log('"npm run build" を実行してください。');
} else {
    console.log('"npm install" と "npm run build" を実行してください。');
}