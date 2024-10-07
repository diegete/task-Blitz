import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateTasksService {

  private apiUrl = 'http://localhost:8000/create-task/'
  private apiUrl2 = 'http://localhost:8000/get-tasks/'
  private apiUrl3 = 'http://localhost:8000/asignar-tarea/'
  private apiUrl4 = 'http://localhost:8000/get-members-details/'
  private apiUrl5 = 'http://localhost:8000/get-tasks-by-usuario/'
  constructor(private http: HttpClient) {}
  // Método para crear una tarea
  createTask(taskData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, taskData, { headers });
  }
  gettask(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl2, { headers });
  }

  asignarTask(taskData: any, token: string): Observable<any>{
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl3, taskData, { headers });
  }
  
  getMembersDetails(memberIds: number[], token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl4, { ids: memberIds }, { headers });
  }

  getTaskAssign(projectId: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl5}?project_id=${projectId}`, { headers });
 }


}
