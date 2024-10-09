import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { CreateTasksService } from '../../services/create-tasks.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css'
})
export class UserViewComponent {
  userData: any = null; 
  selectedProject: any = null; 
  selectedProjectTasks: any[] = []; 
  selectedTask: any = null;
  isTaskModalOpen = false;
  isModalOpen = false;


  constructor(private userService: UserdataService, private loginService: LoginService, private createTask: CreateTasksService) {}

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      // Obtener los datos del usuario al iniciar el componente
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
      });
    } else {
      console.log('No hay un usuario autenticado');
    }
  }

  selectProject(proyecto: any): void {
    const token = this.loginService.getToken();
  
    if (token) {
      this.selectedProject = proyecto;
      this.createTask.getTaskAssign(proyecto.id, token).subscribe(
        tasks => {
          this.selectedProjectTasks = tasks;
          console.log('Tareas asignadas:', this.selectedProjectTasks); // Log de verificación
        },
        error => {
          console.error('Error al obtener las tareas asignadas', error);
        }
      );
    } else {
      console.error('Token no disponible. El usuario no está autenticado.');
    }
  }
  
  
  openTaskModal(tarea: any): void {
    this.selectedTask = tarea;
    this.isTaskModalOpen = true;
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.selectedTask = null;
  }
  showTaskDetail(tarea: any): void {
    this.selectedTask = tarea;
    this.isModalOpen = true;  // Abrir el modal
  }

  closeModal(): void {
    this.isModalOpen = false;  // Cerrar el modal
  }
  
}

