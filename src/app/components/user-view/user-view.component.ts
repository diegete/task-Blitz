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
  
  pendingInvitations: any[] = []; // o una interfaz específica si la tienes
  isInvitationModalOpen = false; // Controla la apertura del modal de invitaciones

  constructor(
    private userService: UserdataService, 
    private loginService: LoginService, 
    private createTask: CreateTasksService, 
    ) {}

    ngOnInit(): void {
      if (this.userService.isLoggedIn()) {
        this.userService.getUserData().subscribe(data => {
          this.userData = data;
    
          // Cargar las invitaciones pendientes
          // this.loadPendingInvitations(); // Llama a la función que carga las invitaciones
        });
      } else {
        console.log('No hay un usuario autenticado');
      }
    }
    

  // // Cargar invitaciones pendientes
  // loadPendingInvitations(): void {
  //   const token = this.loginService.getToken(); 
  
  //   if (token) {
  //     this.createTask.getPendingInvitations(token).subscribe(
  //       invitations => {
  //         this.pendingInvitations = invitations;
  //       },
  //       error => {
  //         console.error('Error al cargar invitaciones pendientes:', error);
  //       }
  //     );
  //   } else {
  //     console.error('No se pudo obtener el token. El usuario no está autenticado.');
  //   }
  // }

  selectProject(proyecto: any): void {
    const token = this.loginService.getToken();
    if (token) {
      this.selectedProject = proyecto;
      this.createTask.getTaskAssign(proyecto.id, token).subscribe(
        tasks => {
          this.selectedProjectTasks = tasks;
        },
        error => {
          console.error('Error al obtener las tareas asignadas', error);
        }
      );
    } else {
      console.error('Token no disponible. El usuario no está autenticado.');
    }
  }

  // Manejar la acción de invitación
  // handleInvitation(invitationId: number, action: string): void {
  //   this.createTask.manageInvitation(invitationId, action).subscribe(
  //     response => {
  //       // Actualizar la lista de invitaciones tras la acción
  //       this.loadPendingInvitations();
  //     },
  //     error => {
  //       console.error('Error al manejar la invitación:', error);
  //     }
  //   );
  // }

  // Abrir y cerrar modal de invitaciones
  openInvitationModal(): void {
    this.isInvitationModalOpen = true;
  }

  closeInvitationModal(): void {
    this.isInvitationModalOpen = false;
  }

  // Manejo del modal de tareas
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
    this.isModalOpen = true; 
  }

  closeModal(): void {
    this.isModalOpen = false;  
  }

}


