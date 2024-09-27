import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTasksService } from '../../services/create-tasks.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userData: any;
  taskForm: FormGroup;
  constructor(
    private userService: UserdataService,
    private taskService: CreateTasksService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el formulario de creación de tareas
    this.taskForm = this.formBuilder.group({
      titulo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      carga: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      proyecto: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        console.log('Datos del usuario:', this.userData);
        if (this.userData && this.userData.proyectos) {
          console.log('Proyectos del usuario:', this.userData.proyectos);
          
        } else {
          console.log('No se encontraron proyectos para el usuario');
        }
      });
    } else {
      console.log('No hay un usuario autenticado');
    }
  }

  // Método para crear una tarea
  createTask(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.taskService.createTask(this.taskForm.value, token).subscribe(response => {
        console.log('Tarea creada:', response);
      }, error => {
        console.error('Error al crear la tarea:', error);
      });
    } else {
      console.error('No se encontró un token');
    }
  }
  
}
