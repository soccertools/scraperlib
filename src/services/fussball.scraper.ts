import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { Match } from '../definitions/match';
import { Team } from '../definitions/team';

export class FussballScraper {

  public scrapeMatches($html: CheerioStatic): Match[] {
    const matches = new Array<Match>();
    const $tableRows = $html('tbody > tr');

    let dynamicOrder = 0;
    let currentMatch = new Match();
    $tableRows.each(
      (i, row) => {
        const columns = $html(row).find('td');
        if (columns.first().attr('colspan') === "6") {
          dynamicOrder = 0;
        }

        switch (dynamicOrder) {
          case 0:
            this.scrapeHeadlineRow($html, row, currentMatch);
            break;
          case 1:
            break;
          case 2:
            this.scrapeDetails($html, row, currentMatch);
            break;
          case 3:
            try {
              this.scrapeLocation($html, row, currentMatch);
            } catch (error) {
              console.warn('FussballScraper', error);
            }
            matches.push(currentMatch);
            currentMatch = new Match();
            break;
        }
        dynamicOrder = (dynamicOrder + 1) % 4;
    });
    return matches;
  }

  public scrapeMatchplanTeams($html: CheerioStatic): Team[] {
    const teams: Team[] = [];
    $html('.club-name').each(
      (index, teamNameItem) => {
        const team = new Team();
        const teamName = $html(teamNameItem).text().trim();
        team.name = teamName;
        teams.push(team);
      }
    );
    return teams;
  }

  private scrapeHeadlineRow($html: CheerioStatic, row: CheerioElement, match: Match) {
    const headline = $html(row).find('td').first().text();
    let headlineParts = headline.split('|');
    headlineParts = headlineParts.map(
      (str) => str.trim()
    );
    console.log(headlineParts);
    if (headlineParts.length < 3) {
      throw new Error('expected headline string with more than 2 pipe separated parts');
    }

    // split e.g. Sonntag, 29.04.2018 - 15:00 Uhr
    const dateSplit = headlineParts[0].split(',');
    if (dateSplit.length !== 2) {
      throw new Error('unexpected date format in headline string');
    }

    const dateTimeSplit = dateSplit[1].split('-');
    if (dateTimeSplit.length !== 2) {
      throw new Error('unexpected date time format in headline string');
    }

    const timeSplit = dateTimeSplit[1].trim().split(':');
    match.date = moment(dateTimeSplit[0].trim(), "DD-MM-YYYY").toDate();
    if (timeSplit.length >= 2) { // not e.g. ['Uhr']
      match.date.setHours(Number.parseInt(timeSplit[0].trim()));
      match.date.setMinutes(Number.parseInt(timeSplit[1].replace('Uhr', '').trim()));
    } else {
      console.warn('unexpected time format, setting date but ignoring time');
    }
    match.context = headlineParts[2];
    match.guest.type = headlineParts[1];
    match.home.type = headlineParts[1];
  }

  private scrapeDetails($html: CheerioStatic, row: CheerioElement, match: Match) {
    let counter = 0;
    $html(row).find('.club-name').each(
      (index, teamNameItem) => {
        const teamName = $html(teamNameItem).text().trim();
        if (counter === 0) {
          match.home.name = teamName;
        } else {
          match.guest.name = teamName;
        }
        counter++;
      }
    );
  }

  private scrapeLocation($html: CheerioStatic, row: CheerioElement, match: Match) {
    const locationColumn = $html(row).find("td[colspan='3']").first().text();

    if (!locationColumn) {
      throw new Error('location column with colspan=3 missing');
    }

    let locationParts = locationColumn.split(',');
    locationParts = locationParts.map(
      (str) => str.trim()
    );

    if (locationParts.length !== 4) {
      throw new Error('unexpected location/venue format');
    }

    match.location.fieldType = locationParts[0];
    match.location.name = locationParts[1];
    match.location.address = locationParts[2] + ", " + locationParts[3];
  }

}
