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

  // assembleProgram(program: string[]): Observable<any> {
  //   return this.http
  //       .post(`${API_URL}/assemble`, {cpucode: program});
  // }

  emulateProgram(task: number, program: string[]): Observable<any> {
    return this.http
      .post(`${API_URL}/emulate`, {task: task, cpucode: program});
  }
}