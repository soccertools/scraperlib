import { Team } from "./team";

export class Club {
  private teams: Array<Team> = [];

  constructor(
    public name: string,
    public id?: string,
  ) {}

  addTeam(team: Team): void {
    this.teams.push(team);
  }

  getTeams(): Array<Team> {
    return this.teams;
  }
}
