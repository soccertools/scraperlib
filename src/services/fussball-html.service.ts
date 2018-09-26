import * as cheerio from 'cheerio';
import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';
import * as urlAssembler from 'url-assembler';
import { MatchplanUrlOptions } from '../definitions/matchplan-url-options';
import { Month } from '../definitions/month';

export class FussballHtmlService {
  private static requestEntryLimit = 200;
  constructor(private httpClient: HttpClient) {}

  public async loadMatchplan(clubId: string, monthOfYear: Month): Promise<CheerioStatic> {
    const urlOptions = new MatchplanUrlOptions();
    urlOptions.dateFrom = this.getBeginnigOfMonth(monthOfYear);
    urlOptions.dateTo = this.getEndOfMonth(monthOfYear);
    urlOptions.maxNumOfEntries = FussballHtmlService.requestEntryLimit;

    const matchplanUrl = this.getMatchplanUrl(
      clubId,
      urlOptions
    );

    try {
      const request = await this.httpClient.get(matchplanUrl);
      const httpBody = await request.readBody();
      const html = JSON.parse(httpBody).html;
      const $page = cheerio.load(html, {
        decodeEntities: false // do not decode special characters as html entities
      });

      return $page;
    } catch (error) {
      throw new Error("Failed to load matchplan from remote");
    }
  }

  public getMatchplanUrl(id: string, options?: MatchplanUrlOptions) {
    if (!options) {
      options = new MatchplanUrlOptions();
    }

    return this.getMatchplanUrlAssembler(id)
      .segment('/mime-type/:mimeType')
      .segment('/mode/:mode')
      .segment('/show-filter/:showFilter')
      .segment('/max/:maxNumOfEntries')
      .segment('/datum-von/:dateFrom')
      .segment('/datum-bis/:dateTo')
      .segment('/offset/0')
      .segment('/show-venues/:showVenues')
      .segment('/show-tabs/:showTabs')
      .segment('/show-legend/:showLegend')
      .param({
        id,
        mimeType: options.mimeType,
        maxNumOfEntries: options.maxNumOfEntries,
        mode: options.mode,
        showFilter: options.isShowFilter,
        dateFrom: this.formatDate(options.dateFrom),
        dateTo: this.formatDate(options.dateTo),
        showVenues: this.formatCheckedParameter(options.isShowVenues),
        showTabs: this.formatBooleanParameter(options.isShowTabs),
        showLegend: this.formatBooleanParameter(options.isShowLegend)
      }, true)
      .toString();
  }

  private getMatchplanUrlAssembler(clubId: string): urlAssembler {
    return urlAssembler("http://www.fussball.de")
    .prefix('/ajax.club.matchplan/-')
    .segment('/id/:id')
    .param('id', clubId, true);
  }

  private getMediaUrlAssembler(clubId: string): urlAssembler {
    // some more params: offset, amount
    return urlAssembler("http://service.media.fussball.de")
    .prefix('/api/mediastream')
    .segment('/ajax/-')
    .segment('/club/:clubId')
    .param('clubId', clubId, true);
  }

  private formatCheckedParameter(isChecked: boolean): string {
    if (isChecked) {
      return "checked";
    } else {
      return "false";
    }
  }

  private formatBooleanParameter(isTrue: boolean): string {
    if (isTrue) {
      return "true";
    } else {
      return "false";
    }
  }

  private formatDate(date: Date): any {
    const isoDate = date.toISOString(); // e.g. 2011-10-05T14:48:00.000Z
    const dateParts = isoDate.split("T"); // split time and date

    // we are expecting date to have at least two parts (date and time)
    if (dateParts.length < 2) {
      throw new Error("Cannot format date");
    }

    return dateParts[0];
  }

  private getBeginnigOfMonth(month: Month): Date {
    const date = new Date();
    date.setMonth(month);
    date.setDate(1);
    return date;
  }

  private getEndOfMonth(month: Month): Date {
    if (month === Month.December) {
        month = Month.January;
    } else {
        month++;
    }

    return this.getBeginnigOfMonth(month);
  }

}
