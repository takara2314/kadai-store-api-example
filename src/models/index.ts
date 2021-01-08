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

// 扱うのタイムゾーンの分だけ、スクレイピング情報を格納するオブジェクト
export interface ScrapingDatas {
    // UTC (Etc/UTC)
    utc?:             ScrapingData;
    utcFuture?:       ScrapingData;
    // 日本 (Asia/Tokyo)
    japan?:           ScrapingData;
    japanFuture?:     ScrapingData;
    // モンゴル (Asia/Ulaanbaatar)
    mongolia?:        ScrapingData;
    mongolia_future?: ScrapingData;
    // タイ (Asia/Bangkok)
    thailand?:        ScrapingData;
    thailandFuture?:  ScrapingData;
}