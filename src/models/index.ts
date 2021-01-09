// 課題情報を格納するオブジェクト
export interface Assignment {
    course?:     string;
    subject?:    string;
    subject_id?: string;
    name?:       string;
    id?:         string;
    due?:        Date;
}

// スクレイピング情報を格納するオブジェクト
export interface ScrapingData {
    acquisition?: Date;
    assignments?: Assignment[];
}

// 扱うタイムゾーンの分だけ、スクレイピング情報を格納するオブジェクト
export interface ScrapingDatas {
    // 全ての課題情報
    all?:    Array<ScrapingData>;
    // 提出期限が未来のものだけの課題情報
    future?: Array<ScrapingData>;
}