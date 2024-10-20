import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invitation } from '../models/invitation.model';



@Injectable({
  providedIn: 'root'
})
export class CreateTasksService {

  private apiUrl = 'http://localhost:8000/create-task/'
  private apiUrl2 = 'http://localhost:8000/get-tasks/'
  private apiUrl3 = 'http://localhost:8000/asignar-tarea/'
  private apiUrl4 = 'http://localhost:8000/get-members-details/'
  private apiUrl5 = 'http://localhost:8000/get-tasks-by-usuario/'
  private apiUrl6 = 'http://localhost:8000/sent-invitation/'
  private apiUrl7 = 'http://localhost:8000/manage-invitation/'
  private apiUrl8 = 'http://localhost:8000/available-employees/'
  private apiUrl9 = 'http://localhost:8000/'

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
 // fixed 
 sendInvitation(invitationData: any, token: string) {
  return this.http.post(`${this.apiUrl6}`, invitationData, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

manageInvitation(invitationId: number, action: string, token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const body = new HttpParams().set('action', action);
  return this.http.post<any>(`${this.apiUrl7}${invitationId}/`, body, { headers });
}


getAvailableEmployees(projectId: number, token: string): Observable<any> {
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.get<any>(`${this.apiUrl8}${projectId}/`, { headers });
}
getPendingInvitations(token: string) {
  return this.http.get<Invitation[]>(`${this.apiUrl9}/pending-invitations/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

updateTask(tarea: any, token: string): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.apiUrl9}update-tasks/${tarea.id}/`, tarea, { headers });
}

}
