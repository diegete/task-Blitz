import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient,private router: Router) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }
  onSubmit() {
    // Validar si las contraseñas coinciden
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
  
    // Construir la URL y el cuerpo de la solicitud
    const resetUrl = `http://localhost:8000/api/password/reset/${this.token}/`;
    const body = {
      token: this.token,
      new_password: this.newPassword,
      confirm_password: this.confirmPassword,
    };
  
    // Realizar la solicitud HTTP
    this.http.post(resetUrl, body).subscribe({
      next: (response) => {
        // Mostrar mensaje de éxito y redirigir al hacer clic en la alerta
        if (confirm('Contraseña cambiada exitosamente. ¿Deseas iniciar sesión ahora?')) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        // Manejar errores y mostrar una alerta
        alert('Error al cambiar la contraseña. Por favor, intenta nuevamente.');
      }
    });
  }
  
  volver(){
    this.router.navigate(['/login'])
  }
  
}
