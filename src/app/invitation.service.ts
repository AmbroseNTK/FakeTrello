import { Injectable } from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireAuth} from '@angular/fire/auth';
import {Team} from './team-editor/team-editor.component';

class Invitation {
  constructor(public from: string, public to: string, public teamID: string, public status: string) {}
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) { }

  private changeInvitation: (invitation: Invitation) => void;

  public sendInvitation(invitation: Invitation) {
    this.db.list('invitation/').push(invitation);
  }

  public onChangeInvitation(callback: (invitation: Invitation) => void) {
    this.changeInvitation = callback;
  }

  public fetchInvitation(teamId: string) {
    this.db.list('invitation/').query.on('value', snapShot => {
        snapShot.forEach(invitation => {
          if (invitation.child('teamID').val() === teamId) {
            const inv = new Invitation(
              invitation.child('from').val(),
              invitation.child('to').val(),
              invitation.child('teamID').val(),
              invitation.child('status').val()
            );
            this.changeInvitation(inv);
          }
        });
    });
  }
}
