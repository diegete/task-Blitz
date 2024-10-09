import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateProyectService {
  private apiUrl = 'http://localhost:8000/crear-proyectos/';

  constructor(private http:HttpClient) {}
 
  createProyect(proyectData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, proyectData, { headers });
  }
}
