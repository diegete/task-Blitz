import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private apiUrl = 'http://localhost:8000/api/notifications/';
  constructor(private http: HttpClient) {}

  // Obtén el token CSRF desde las cookies
  getCsrfToken(): string | null {
    const csrfCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  }

  // Envía el token en los encabezados de una solicitud
  sendPostRequest(url: string, body: any) {
    const csrfToken = this.getCsrfToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken || '', // Incluye el token CSRF
    });
    return this.http.post(url, body, { headers, withCredentials: true });
  }

  getNotifications(token:string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.apiUrl, {headers});
  }

  markAsRead(notificationId: number, token:string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.apiUrl, { notification_id: notificationId },{headers});
  }
}
