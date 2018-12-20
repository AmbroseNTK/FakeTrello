import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(public auth: AngularFireAuth) { }

  public email = '';
  public password = '';

  ngOnInit() {
  }

  public signUp(email: string, password: string) {
    this.auth.auth.createUserWithEmailAndPassword(email, password).then(value => {
      alert(value);
    }).catch(reason => {
      alert(reason);
    });
  }

}
