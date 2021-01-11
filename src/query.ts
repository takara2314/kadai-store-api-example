import { Assignment, ScrapingData } from './models';

// スクレイピング情報から、特定の教科のみを抽出して返す関数
export const query = (data: ScrapingData, subjects: string[]): ScrapingData => {
    // 全ての課題情報
    let kadaiInfos: Assignment[] = Array();

    for (let i: number = 0; i < data.assignments.length; i++) {
        if (subjects.includes(data.assignments[i].subject_id)) {
            const kadaiInfo: Assignment = {
                course:     data.assignments[i].course,
                subject:    data.assignments[i].subject,
                subject_id: data.assignments[i].subject_id,
                name:       data.assignments[i].name,
                id:         data.assignments[i].id,
                due:        data.assignments[i].due
            };
            kadaiInfos.push(kadaiInfo);
        }
    }

    return {
        acquisition: data.acquisition,
        assignments: kadaiInfos
    };
};