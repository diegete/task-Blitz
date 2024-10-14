import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateProyectService {
  private apiUrl = 'http://localhost:8000/crear-proyectos/';
  private apiUrl2 = 'http://localhost:8000/proyecto/'
  constructor(private http:HttpClient) {}
 
  createProyect(proyectData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, proyectData, { headers });
  }

  actualizarPrioridad(proyectoId: number, prioridad: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); 
    return this.http.post(`${this.apiUrl2}${proyectoId}/prioridad/`, { prioridad },{headers}
    );
  }

}
