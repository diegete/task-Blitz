import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateTasksService {

  private apiUrl = 'http://localhost:8000/create-task/'
  
  constructor(private http: HttpClient) {}
  // Método para crear una tarea
  createTask(taskData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, taskData, { headers });
  }
}
