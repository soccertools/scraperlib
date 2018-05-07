import * as cheerio from 'cheerio';
import { Matchplan } from './matchplan';
import { Team } from './team';
import { Match } from './match';
import * as moment from 'moment';

export class FussballScraper {
  constructor() {}

  private scrapeHeadlineRow($html: CheerioStatic, row: CheerioElement, match: Match) {
    const headline = $html(row).find('td').first().text();
    let headlineParts = headline.split('|');
    headlineParts = headlineParts.map(
      (str) => str.trim()
    );
    // split e.g. Sonntag, 29.04.2018 - 15:00 Uhr
    const dateSplit = headlineParts[0].split(',');
    const dateTimeSplit = dateSplit[1].split('-');
    const timeSplit = dateTimeSplit[1].trim().split(':');
    match.date = moment(dateTimeSplit[0].trim(), "DD-MM-YYYY").toDate();
    if (timeSplit.length >= 2) { // not e.g. ['Uhr']
      match.date.setHours(Number.parseInt(timeSplit[0].trim()));
      match.date.setMinutes(Number.parseInt(timeSplit[1].replace('Uhr', '').trim()));
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
        if(counter === 0) {
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
    let locationParts = locationColumn.split(',');
    locationParts = locationParts.map(
      (str) => str.trim()
    );

    if (locationParts.length != 4) {
      match.location = undefined;
    }

    match.location.fieldType = locationParts[0];
    match.location.name = locationParts[1];
    match.location.address = locationParts[2] + ", " + locationParts[3];
  }

  scrapeMatchplan($html: CheerioStatic): any {
    const matchplan = new Matchplan();
    const $tableRows = $html('tbody > tr');

    //const $tableRows = $matchplanSection()
    let dynamicOrder = 0;
    let currentMatch = new Match();
    $tableRows.each(
      (i, row) => {
        const columns = $html(row).find('td');
        if(columns.first().attr('colspan') === "6") {
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
            this.scrapeLocation($html, row, currentMatch);
            matchplan.addMatch(currentMatch);
            currentMatch = new Match();
            break;
        }
        dynamicOrder = (dynamicOrder + 1) % 4;
    });
    return matchplan;
  }

  scrapeMatchplanTeams($html: CheerioStatic): Array<Team> {
    let teams: Array<Team> = [];
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

  scrape
}
