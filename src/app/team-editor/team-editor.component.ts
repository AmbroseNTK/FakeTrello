import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {AngularFireAuth} from '@angular/fire/auth';
import {TeamServiceService} from '../team-service.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


export class Team {
  constructor(public ref= '', public name= '', public description= '', public members: Array<Member>) {}
}

export class Member {
  constructor(public email: string, public status: string ) {}
}

@Component({
  selector: 'app-team-editor',
  templateUrl: './team-editor.component.html',
  styleUrls: ['./team-editor.component.css']
})
export class TeamEditorComponent implements OnInit {

  public teamName = '';
  public teamDescription = '';
  public newEmail = '';

  public currentTeam;
  public currentInviteTeam;

  modal;
  members: any;

  teamRef: AngularFireList<any>;
  listTeam: Observable<any[]>;

  inviteTeamRef: Array<AngularFireList<any>>;
  listInviteTeam: Array<Observable<any[]>>;

  invitationRef: AngularFireList<any>;
  listInvitation: Observable<any[]>;

  memberRef: AngularFireList<any>;
  listMember: Observable<any[]>;

  inviteKeys: Array<any>;

  myInvitationKeys: Array<any>;

  selection: any;



  constructor(private modalService: NgbModal,
              private db: AngularFireDatabase,
              private auth: AngularFireAuth,
              private teamService: TeamServiceService) {


    this.teamRef = db.list('users/' + this.getCurrentUser() + '/team/');
    this.listTeam = this.teamRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.invitationRef = db.list('users/' + this.getCurrentUser() + '/invitation/');
    this.listInvitation = this.invitationRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
    this.invitationRef.snapshotChanges().subscribe(snapshot => {
      this.myInvitationKeys = new Array<any>();
      snapshot.forEach(value => {
        this.myInvitationKeys.push(value.key);
      });
    });

    this.listInvitation.subscribe(snapshot => {
      this.inviteKeys = new Array<any>();
      this.inviteTeamRef = new Array<AngularFireList<any>>();
      this.listInviteTeam = new Array<Observable<any[]>>();
      snapshot.forEach(value => {
        this.inviteKeys.push(value.key);
        const ref = this.db.list(value.ref + 'team/');
        const val = ref.snapshotChanges().pipe(
          map(changes =>
            changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
          )
        );
        this.inviteTeamRef.push(ref);
        this.listInviteTeam.push(val);
      });
    });

  }

  hasPermission(teamID) {
    return  this.inviteKeys.includes(teamID);
  }

  ngOnInit() {
  }
  public open(content, team) {
    this.modal = this.modalService.open(content);
    this.currentTeam = team;
    this.switchTeam(team);
    console.log(this.currentTeam);
  }

  getCurrentUser(): string {
    return this.auth.auth.currentUser.email.replace('@', '*').replace('.', '|');
  }

  deleteMember(key: any) {
    this.memberRef.remove(key);
  }

  inviteMember(email) {
    this.memberRef.push({email: email});
    this.db.list('users/' + email.replace('@', '*').replace('.', '|') + '/invitation/').push({key: this.currentTeam.key, ref: this.currentTeam.ref});
  }

  switchTeam(currentTeam) {
    this.teamService.notifyTeamChange(currentTeam);
    this.currentTeam = currentTeam;
    this.memberRef = this.db.list(currentTeam.ref + '/team/' + currentTeam.key + '/members/');
    this.listMember = this.memberRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  updateTeam(key: any, name: any, description: any) {
    this.teamRef.update(this.currentTeam.key, {name: name, description: description});
  }

  deleteTeam(key: any) {
    this.teamRef.remove(key);
  }

  switchInviteTeam(selection) {
    this.currentInviteTeam = selection.team;
    this.teamService.notifyTeamChange(selection.team);
  }

  updateInviteTeam(selection) {
    this.inviteTeamRef[selection.index].update(this.inviteKeys[selection.index], {name: selection.team.name, description: selection.team.description});
  }

  rejectTeam(selection) {
    this.invitationRef.remove(this.myInvitationKeys[selection.index]);
  }


  createTeam() {
    const team = new Team('users/' + this.getCurrentUser() + '/', this.teamName, this.teamDescription, new Array<Member>());
    this.db.list('users/' + this.getCurrentUser() + '/team/').push(team);
  }

  openWithObject(content: any, obj: any) {
    this.modalService.open(content);
    this.selection = obj;
  }
}
