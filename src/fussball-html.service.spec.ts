import "jasmine";
import { FussballHtmlService } from "./fussball-html.service";
import { HttpClient } from 'typed-rest-client/HttpClient';

describe('FussballHtmlService', () => {
  let fussballHtmlService: FussballHtmlService;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('some client');
    fussballHtmlService = new FussballHtmlService(httpClient);
  });

  it('should be created', () => {
    expect(fussballHtmlService).toBeTruthy();
  });
});
