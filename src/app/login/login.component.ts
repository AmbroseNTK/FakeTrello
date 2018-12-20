import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireDatabase} from '@angular/fire/database';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public userName = '';
  public password = '';

  constructor(private auth: AngularFireAuth, private router: Router) {

  }

  public login() {
    if (this.userName == '') {
      this.userName = 'admin@gmail.com';
      this.password = '000000';
    } else {
      this.userName = 'a@gmail.com';
      this.password = '000000';
    }
    this.auth.auth.signInWithEmailAndPassword(this.userName, this.password).then(value => {
      console.log(value);
      this.router.navigateByUrl('main');
    }).catch(reason => {
      console.log(reason);
      alert(reason);
    });
  }

  ngOnInit() {
  }

}
