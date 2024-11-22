import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule, Form} from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { UserRegisterService } from '../../services/user-register.service';
import { CommonModule } from '@angular/common';
import { UserdataService } from '../../services/userdata.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isModalOpen = false;
  userData = {
    username: '',
    email: '',
    password: '',
    profile: {
      user_type: '',
      
    }
  };
  showNotification = false;
  loginForm: FormGroup;
  modalForm: FormGroup;

  constructor(private formBuilder: FormBuilder,private authService:LoginService,private router:Router
    , private usuarioService:UserRegisterService, private userService: UserdataService) {
      // formulario login
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // formulario del modal 
    this.modalForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['',[Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      user_type: ['',Validators.required]
  
     })
  }
   

  login() {
    if (this.loginForm.invalid) {
      return; // No permite continuar si el formulario no es válido
    }
  
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      (response) => {
        // console.log('Inicio de sesión exitoso', response);
        this.authService.setToken(response.access); // Guardar el token
        //console.log('Token guardado:', this.authService.getToken()); mostrar el token 
  
        // Obtener los datos del usuario
        this.userService.getUserData().subscribe(data => {
          this.userData = data;
  
          // Redirigir según el tipo de usuario
          if (this.userData.profile.user_type === 'jefe') {
            this.router.navigate(['/home']);
          } else if (this.userData.profile.user_type === 'empleado') {
            this.router.navigate(['/user-view']);
          }
        });
      },
      (error) => {
        console.error('Error en el inicio de sesión:', error);
        // Mostrar notificación de error en las credenciales
        alert('Usuario o contraseña incorrectos');
      }
    );
  }
  
   
  createUser() {
    this.userData.username = this.modalForm.value.username;
    this.userData.email = this.modalForm.value.email;
    this.userData.password = this.modalForm.value.password;
    this.userData.profile.user_type = this.modalForm.value.user_type;

    this.usuarioService.createUser(this.userData).subscribe(response => {
      console.log('Usuario creado:', response);
      this.resetForm(); 
      this.showSuccessNotification(); 
      alert('Usuario creado')
      this.closeModal()
      this.router.navigate(['/login']);
    }, error => {
     
      console.error('Error al crear usuario:', error, this.modalForm.value);
    });

    
  }
  forgot(){
    this.router.navigate(['/auth/password-reset']);
  }

  resetForm() {
    this.userData = {
      username: '',
      email: '',
      password: '',
      profile: {
        user_type: 'jefe',
        
      }
    };
  }

  showSuccessNotification() {
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000); // Mostrar notificación durante 3 segundos
  }
  closeModal(): void {
    this.isModalOpen = false;
    this.modalForm.reset(); // Resetea el formulario al cerrar el modal
  }

  openModal() {
    this.isModalOpen = true;
  }


}
  

