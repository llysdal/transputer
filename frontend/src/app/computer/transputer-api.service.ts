import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_URL} from '../env';

@Injectable()
export class TransputerApiService {

  constructor(private http: HttpClient) {
  }

  getTaskList(): Observable<any> {
    return this.http
        .get(`${API_URL}/tasks`);
  }

  getTask(task: number): Observable<any> {
    return this.http
        .get(`${API_URL}/task?id=` + task);
  }

  assembleProgram(program: string[]): Observable<any> {
    let replacedProgram = '';
    for (let code of program) {
      //Replace \n with %0A and & with %26
      replacedProgram += 'program[]=' + code.replace(/(?:\r\n|\r|\n)/g, '%0A').replace(/&/g, '%26') + '&';
    }
    replacedProgram = replacedProgram.slice(0, replacedProgram.length - 1)

    return this.http
        .get(`${API_URL}/assemble?` + replacedProgram);
  }

  emulateProgram(task: number, program: string[]): Observable<any> {
    let replacedProgram = '';
    for (let code of program) {
      //Replace \n with %0A
      replacedProgram += 'program[]=' + code.replace(/(?:\r\n|\r|\n)/g, '%0A').replace(/&/g, '%26') + '&';
    }
    replacedProgram = replacedProgram.slice(0, replacedProgram.length - 1)

    return this.http
      .get(`${API_URL}/emulate?task=${task}&${replacedProgram}`);
  }
}