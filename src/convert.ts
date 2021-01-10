import { Assignment, ScrapingData } from './models';
import * as moment from 'moment-timezone';

// スクレイピング情報の時刻を、そのタイムゾーンに合わせる関数
export const infoTimeConv = (data: ScrapingData, timezone: string): ScrapingData => {
    // 全ての課題情報
    let kadaiInfos: Array<Assignment> = [];

    for (let i: number = 0; i < data.assignments!.length; i++) {
        // 課題情報の時刻を、そのタームゾーンに合わせる
        const kadaiInfo: Assignment = {
            course:     data.assignments![i].course,
            subject:    data.assignments![i].subject,
            subject_id: data.assignments![i].subject_id,
            name:       data.assignments![i].name,
            id:         data.assignments![i].id,
            due:        moment.default(data.assignments![i].due).tz(timezone).toDate()
        };

        kadaiInfos.push(kadaiInfo);
    }

    return {
        acquisition: moment.default(data.acquisition).tz(timezone).toDate(),
        assignments: kadaiInfos
    };
};