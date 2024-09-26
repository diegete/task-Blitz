import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {jwtDecode } from 'jwt-decode'; //manejo de tokens 
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'http://localhost:8000/login/'
  private tokenKey = 'token'

  constructor(private http:HttpClient) { }


  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { username, password }).pipe(
      tap(response => {
        // Suponiendo que el token viene en response.token
        const token = response.token;
        if (token) {
          // Guardar el token en localStorage o sessionStorage
          localStorage.setItem('token', token);
          
          // Opcional: decodificar el token si quieres obtener y usar datos específicos
          const decodedToken = jwtDecode(token);
          console.log('Datos del token decodificado:', decodedToken);
          // Puedes almacenar información adicional en el servicio si es necesario
        }
      })
    );
  }
  
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

    // Método para cerrar sesión
    logout(): void {
      localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
      // Verifica si el token existe
      return !!localStorage.getItem('token');
    }


}
