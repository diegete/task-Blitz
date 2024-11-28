import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CsrfService } from '../../services/csrf.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent {
  email: string = '';

  constructor(private csrfService: CsrfService,private router:Router) {}

  onSubmit() {
    const resetUrl = 'http://localhost:8000/api/password/reset/';
    const body = { email: this.email };
  
    this.csrfService.sendPostRequest(resetUrl, body).subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        alert('Correo de restablecimiento enviado.');
      },
      (error) => {
        console.error('Error del servidor:', error);
        alert('Error al enviar el correo de restablecimiento. Revisa los datos ingresados.');
      }
    );
  }
  volver(){
    this.router.navigate(['/login'])
  }

}
