import { MatchLocation } from './match-location';
import { Team } from './team';

export class Match {
  constructor(){}

  public home = new Team();
  public guest = new Team();
  public location? = new MatchLocation();
  public context?: string; // e.g. Kreisliga, Freundschaftsspiel, Pokalspiel
  public date?: Date;
}
