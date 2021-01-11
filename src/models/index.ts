// 課題情報を格納するオブジェクト
export interface Assignment {
    course:     string;
    subject:    string;
    subject_id: string;
    name:       string;
    id:         string;
    due:        string;
}

// スクレイピング情報を格納するオブジェクト
export interface ScrapingData {
    acquisition: string;
    assignments: Assignment[];
}

// 扱うタイムゾーンの分だけ、スクレイピング情報を格納するオブジェクト
export interface ScrapingDatas {
    // 全ての課題情報
    all:    ScrapingData[];
    // 提出期限が未来のものだけの課題情報
    future: ScrapingData[];
}