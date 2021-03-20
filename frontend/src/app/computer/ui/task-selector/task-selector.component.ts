import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { TransputerApiService } from '../../transputer-api.service';

@Component({
  selector: 'app-task-selector',
  templateUrl: './task-selector.component.html',
  styleUrls: ['./task-selector.component.scss']
})
export class TaskSelectorComponent implements OnInit {
  
  @Input() activeTask;
  @Input() maxTask;
  @Output() taskId = new EventEmitter<number>();
  taskList = [];

  constructor(
    private cookieService: CookieService,
    private transputerService: TransputerApiService,
  ) { }

  async ngOnInit() {
    this.taskList = await this.transputerService.getTaskList().toPromise();
  }

  emitTask(task) {
    this.taskId.emit(task.id);
  }
}
