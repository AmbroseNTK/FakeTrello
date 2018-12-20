import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TeamServiceService} from '../team-service.service';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {load} from '@angular/core/src/render3';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {


  constructor(private route: ActivatedRoute, private team: TeamServiceService, private db: AngularFireDatabase, private modal: NgbModal) {

  }

  boardID;

  currentTeam;
  currentBoard;

  listListRef: AngularFireList<any>;
  listList: Observable<any[]>;

  listTaskRef: Array<AngularFireList<any>>;
  listTask: Array<Observable<any[]>>;

  selection;

  ngOnInit() {
    this.boardID = this.route.snapshot.paramMap.get('boardID');

    this.load();
  }

  load() {
    this.currentTeam = this.team.currentTeam;
    this.currentBoard = this.team.currentBoard;

    const ref = this.team.currentTeam.ref + '/team/' + this.team.currentTeam.key + '/boards/' + this.boardID + '/';
    this.listTaskRef = new Array<AngularFireList<any>>();
    this.listTask = new Array<Observable<any[]>>();
    this.listListRef = this.db.list(ref + '/lists/');
    this.listList = this.listListRef.snapshotChanges().pipe(
      map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()}))));
    this.listListRef.snapshotChanges().forEach(snapshot => {
      snapshot.forEach(value => {
        const taskRef = this.db.list(ref + '/lists/' + value.payload.key + '/tasks/');
        const tasks = taskRef.snapshotChanges().pipe(
          map(innerChanges =>
            innerChanges.map(c => ({ key: c.payload.key, ...c.payload.val() }))
          )
        );
        this.listTaskRef.push(taskRef);
        this.listTask.push(tasks);
      });
    });
  }

  createList(name: string) {
    this.listListRef.push({name: name});
    this.load();
  }

  open(modal: any) {
    this.modal.open(modal);
  }

  openWithObject(newTaskModal: any, obj: any) {
    this.modal.open(newTaskModal);
    this.selection = obj;
  }

  createTask(taskName: string, taskDescription: string) {
    this.listTaskRef[this.selection].push({name: taskName, description: taskDescription});
  }

  updateList(value: string) {
    this.listListRef.update(this.selection.key, {name: value});
  }

  deleteList() {
    this.listListRef.remove(this.selection.key);
    this.load();
  }

  updateTask(name: string, description: string) {
    this.listTaskRef[this.selection.index].update(this.selection.task.key, {name: name, description: description});
  }

  deleteTask() {
    this.listTaskRef[this.selection.index].remove(this.selection.task.key);
  }
}
