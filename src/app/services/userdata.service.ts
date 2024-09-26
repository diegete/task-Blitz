import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserdataService {
  private apiUrl= 'http://localhost:8000/api/user-data/'

  constructor(private http: HttpClient) { }

  getDecodedToken(): any{
    const token = localStorage.getItem('token');
    if (token) {
      return jwtDecode(token);
  }
  return null
  }

  getUserData(): Observable<any> {
    const token = localStorage.getItem('token');
    if (token) {
      return this.http.get(this.apiUrl, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      }).pipe(
        catchError(error => {
          console.error('Error al obtener datos del usuario:', error);
          return of(null);
        })
      );
    } else {
      return of(null);
    }
  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

}
