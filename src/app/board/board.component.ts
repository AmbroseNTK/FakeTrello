import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TeamServiceService} from '../team-service.service';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {


  constructor(private route: ActivatedRoute, private team: TeamServiceService, private db: AngularFireDatabase, private modal: NgbModal) {

  }

  boardID;
  currentModal;

  currentTeam;
  currentBoard;

  listListRef: AngularFireList<any>;
  listList: Observable<any[]>;

  listTaskRef: Array<AngularFireList<any>>;
  listTask: Array<Observable<any[]>>;

  selection;

  listOrder: Array<number>;
  listOfList: Array<any>;

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
    this.listListRef = this.db.list(ref + '/lists/',  query => query.orderByChild('order'));
    this.listList = this.listListRef.snapshotChanges().pipe(
      map(changes => changes.map(c => ({key: c.payload.key, ...c.payload.val()}))));
    this.listListRef.snapshotChanges().forEach(snapshot => {
      this.listOrder = new Array<number>();
      this.listOfList = new Array<number>();
      snapshot.forEach(value => {
        const taskRef = this.db.list(ref + '/lists/' + value.payload.key + '/tasks/');
        const tasks = taskRef.snapshotChanges().pipe(
          map(innerChanges =>
            innerChanges.map(c => ({ key: c.payload.key, ...c.payload.val() }))
          )
        );
        this.listTaskRef.push(taskRef);
        this.listTask.push(tasks);
        this.listOrder.push(value.payload.val().order);
        this.listOfList.push({key: value.key, order: value.payload.val().order});
      });
    });
  }

  createList(name: string) {
    this.listListRef.push({name: name,  order: this.listOrder.length });
    this.load();
    this.currentModal.close();
  }

  open(modal: any) {
    this.currentModal = this.modal.open(modal);
  }

  openWithObject(newTaskModal: any, obj: any) {
    this.currentModal = this.modal.open(newTaskModal);
    this.selection = obj;
  }

  createTask(taskName: string, taskDescription: string) {
    this.listTaskRef[this.selection].push({name: taskName, description: taskDescription});
    this.currentModal.close();
  }

  updateList(value: string) {
    this.listListRef.update(this.selection.key, {name: value});
    this.currentModal.close();
  }

  deleteList() {
    this.listListRef.remove(this.selection.key);
    this.load();
    this.currentModal.close();
  }

  updateTask(name: string, description: string) {
    this.listTaskRef[this.selection.index].update(this.selection.task.key, {name: name, description: description});
    this.currentModal.close();
  }

  deleteTask() {
    this.listTaskRef[this.selection.index].remove(this.selection.task.key);
    this.currentModal.close();
  }

  moveList(value: any, isAfter = true) {

    const current = parseInt(value.value, 10);
    if (isAfter) {
      let after = 0;
      if (current === this.listOrder.length - 1) {
        after = this.listOrder[current] + 1;
      } else {
        after = this.listOrder[current + 1];
      }
      // this.listListRef.update(this.selection.key, {order: (this.listOrder[current] + before) / 2});
      this.sortList(current, after);
    } else {
      let before = 0;
      if (current === 0) {
        before = -1;
      } else {
        before = this.listOrder[current - 1];
      }
      this.sortList(current, before);
    }
  }
  sortList(current, before) {
    for (let i = 0; i < this.listOfList.length; i++) {
      if (this.selection.key === this.listOfList[i].key) {
        this.listOfList[i].order = (current + before) / 2;
      }
    }
    this.listOfList = this.listOfList.sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      } else if (a.order < b.order) {
        return -1;
      }
      return 0;
    });
    for (let i = 0; i < this.listOfList.length; i++) {
      this.listListRef.update(this.listOfList[i].key, {order: i}).then(value => {this.load(); });
    }
  }

  moveTask(value: any) {
    const target = parseInt(value.value, 10);
    const targetTask = this.selection.task;
    delete targetTask.key;
    this.listTaskRef[target].push(targetTask);
    this.listTaskRef[this.selection.index].remove(this.selection.task.key);
    this.currentModal.close();
    this.load();
  }

  copyTask(value: any) {
    const target = parseInt(value.value, 10);
    const targetTask = this.selection.task;
    delete targetTask.key;
    this.listTaskRef[target].push(targetTask);
    this.currentModal.close();
    this.load();
  }
}
