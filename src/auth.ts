import express from 'express';
import { config } from './index';

export const auth = (req: express.Request): number => {
    // ヘッダー "Authorization" を取得
    let authorization: string = req.header('Authorization') === undefined ? '' : req.header('Authorization') as string;
    console.log(`(Authorization: ${authorization})`);

    // トークン部分が allow-tokens になければ、結果的に不許可
    let index: number = config['allow-tokens']
        .indexOf(authorization.slice(7));
    // スキームが Bearer でなければ、結果的に不許可
    if (authorization.slice(0, 6) !== 'Bearer') {
        index = -1;
    }

    return index;
}