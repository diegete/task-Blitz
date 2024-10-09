import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserRegisterService {
  
  private apiUrl = 'http://localhost:8000/api/users/';

  constructor(private http:HttpClient) {}
 
  createUser(proyectoData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.apiUrl, proyectoData, { headers });
  }
}
