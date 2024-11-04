import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl = 'http://localhost:8000/';  

  constructor(private http: HttpClient) {}

  // Obtener mensajes del chat para un proyecto específico
  getMessages(proyectoId: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/proyectos/${proyectoId}/messages/`, { headers });
  }

  // Enviar un nuevo mensaje al chat
  sendMessage(proyectoId: number, content: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}/proyectos/${proyectoId}/messages/send/`, { content }, { headers });
  }
}
