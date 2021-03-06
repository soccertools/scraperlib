import * as cheerio from 'cheerio';
import "jasmine";
import { HttpClient } from 'typed-rest-client/HttpClient';
import { Match } from '../definitions/match';
import { FussballScraper } from "./fussball.scraper";

const htmlSkeleton = cheerio.load(
  `
  <!DOCTYPE html>
  <html>
  </html>
  `
);

const htmlMatchtableWithOneValidMatch = cheerio.load(
  `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Some Page</title>
    </head>
    <body>
      <table>
        <tbody>
          <tr>
            <td>Dienstag, 22.11.2033 - 10:20 Uhr | Z-Junioren | Eine Liga</td>
          </tr>
          <tr><td>Some Content</td></tr>
          <tr>
            <td>Some Content</td>
            <td>
              <div class="club-name">FC Home</div>
              <div class="club-name">FC Guest</div>
            </td>
          </tr>
          <tr>
            <td colspan="3">
  						Rasenplatz, Irgendein Sportplatz, Irgend Wo 3, 91610 Musterhausen
  					</td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `
);

describe('FussballScraper', () => {
  let fussballScraper: FussballScraper;

  beforeAll(() => {
    fussballScraper = new FussballScraper();
  });

  it('should be created', () => {
    expect(fussballScraper).toBeTruthy();
  });

  it('should return an empty set of matches if there is no table in html', () => {
    const matches: Match[] = fussballScraper.scrapeMatches(htmlSkeleton);
    expect(matches.length).toBe(0);
  });

  describe('scraping valid html with single match', () => {
    let matches: Match[];

    beforeEach(() => {
      matches = fussballScraper.scrapeMatches(htmlMatchtableWithOneValidMatch);
    });

    it('should scrape one match', () => {
      expect(matches.length).toBe(1);
    });

    it('should scrape correct team names', () => {
      expect(matches[0].home.name).toBe('FC Home');
      expect(matches[0].guest.name).toBe('FC Guest');
    });

    it('should scrape correct date', () => {
      expect(matches[0].date.toISOString()).toBe('2033-11-22T09:20:00.000Z');
    });

  });

  // TODO: Implement Test
  xit('should scrape match with no location row', () => {
    const html: string = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Some Page</title>
      </head>
      <body>
        <table>
          <tbody>
            <tr>
              <td>Dienstag, 22.11.2033 - 10:20 Uhr | Z-Junioren | Eine Liga</td>
            </tr>
            <tr><td>Some Content</td></tr>
            <tr>
              <td>Some Content</td>
              <td>
                <div class="club-name">FC Home</div>
                <div class="club-name">FC Guest</div>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
    `;
    const matches = fussballScraper.scrapeMatches(cheerio.load(html));

    expect(matches.length).toBe(1);
    expect(matches[0].location).not.toBeDefined();
  });

  // TODO: Implement Test
  xit('should throw error if match dates are inconsistent', () => {
    fail();
  });

});
