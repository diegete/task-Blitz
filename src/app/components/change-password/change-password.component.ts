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
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
  
    // Usa el token dinámico en la URL
    const resetUrl = `http://localhost:8000/api/password/reset/${this.token}/`;
    const body = { token: this.token, new_password: this.newPassword, confirm_password: this.confirmPassword };
  
    this.http.post(resetUrl, body).subscribe(
      (response) => alert('Contraseña cambiada exitosamente.'),
      (error) => alert('Error al cambiar la contraseña.')
    );
  }

  volver(){
    this.router.navigate(['/login'])
  }
  
}
