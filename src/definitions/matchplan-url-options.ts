export type MimeType = "JSON";
export type Mode = "PAGE";

export class MatchplanUrlOptions {

    public mimeType: MimeType = "JSON";
    public mode: Mode = "PAGE";
    public maxNumOfEntries = 10;
    public dateFrom: Date = new Date();
    public dateTo: Date = new Date();
    public entryOffset = 0;
    public isShowFilter = false;
    public isShowVenues = true;
    public isShowLegend = false;
    public isShowTabs = false;

}
