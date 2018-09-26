import { Team } from "./team";

export class Club {
  private teams: Team[] = [];

  constructor(
    public name: string,
    public id?: string,
  ) {}

  public addTeam(team: Team): void {
    this.teams.push(team);
  }

  public getTeams(): Team[] {
    return this.teams;
  }
}
