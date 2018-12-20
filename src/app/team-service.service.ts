import { Injectable } from '@angular/core';
import {AngularFireList} from '@angular/fire/database';
import {Team} from './team-editor/team-editor.component';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class TeamServiceService {


  constructor() {
  }

  public currentTeam;

  public currentBoard;

  public onChangeTeam: (team) => void;

  public notifyTeamChange(team: any) {
    this.currentTeam = team;
    this.onChangeTeam(team);
  }




}
