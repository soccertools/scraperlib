import { Match } from './match';

export class Matchplan {
  private matches: Array<Match> = [];

  addMatch(match: Match): void {
    this.matches.push(match);
  }

  getMatches() {
    return this.matches;
  }
}
