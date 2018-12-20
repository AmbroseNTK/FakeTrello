import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {TeamServiceService} from '../team-service.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class Board {
  constructor(public name, public description, public color) {}
}

@Component({
  selector: 'app-board-editor',
  templateUrl: './board-editor.component.html',
  styleUrls: ['./board-editor.component.css']
})
export class BoardEditorComponent implements OnInit {



  boardRef: AngularFireList<any>;
  boardList: Observable<any[]>;

  currentBoard: any;
  boardBackground = '';
  boardName: any;
  boardDescription: any;
  modal: any;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal, private teamService: TeamServiceService) {
    this.teamService.onChangeTeam = team => {
      this.boardRef = this.db.list(team.ref + '/team/' + team.key + '/boards/');
      this.boardList = this.boardRef.snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
    };
  }

  ngOnInit() {
  }


  setColor(s: string) {
    this.currentBoard.background = s;
  }

  openBoard(key: any) {

  }

  openSetting(modalUpdateBoard, board) {
    this.currentBoard = board;
    this.teamService.currentBoard = board;
    this.modal = this.modalService.open(modalUpdateBoard);
  }

  create(modalCreateBoard) {
    this.modal = this.modalService.open(modalCreateBoard, {ariaLabelledBy: 'modal-basic-title'});
  }

  createBoard() {
    this.boardRef.push({name: this.boardName, description: this.boardDescription, background: this.boardBackground});
  }

  updateBoard(key,boardName, boardDescription,boardBackground) {
    this.boardRef.update(key,{name: boardName, description: boardDescription, background: boardBackground});
  }

  deleteBoard(key) {
    this.boardRef.remove(key);
  }
}
