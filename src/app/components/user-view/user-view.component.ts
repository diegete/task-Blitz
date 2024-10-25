import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { CreateTasksService } from '../../services/create-tasks.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
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
  pendingInvitations: any[] = [];
  token: string | null = null;  // Variable para almacenar el token
  isInvitationModalOpen = false; // Controla la apertura del modal de invitaciones
  pendingInvitationCount = 0;
  showInvitations: boolean = false;
  taskUpdateForm: FormGroup;


  constructor(
    private userService: UserdataService, 
    private loginService: LoginService, 
    private createTask: CreateTasksService,
    private formBuilder: FormBuilder
    ) {
      this.taskUpdateForm = this.formBuilder.group({
        avance: ['', Validators.required],
      });
    }

    ngOnInit(): void {
      if (this.userService.isLoggedIn()) {
        this.userService.getUserData().subscribe(data => {
          this.userData = data;
          this.loadPendingInvitations(); 
          // Cargar las invitaciones pendientes
        });
      } else {
        console.log('No hay un usuario autenticado');
      }
    }
    
    loadPendingInvitations(): void {
      this.token = this.loginService.getToken();
      if (this.token) {
        this.createTask.getPendingInvitations(this.token).subscribe(
          invitations => {
            this.pendingInvitations = invitations;
            this.pendingInvitationCount = invitations.length; // Actualizar el contador de invitaciones
          },
          error => {
            console.error('Error al cargar invitaciones pendientes:', error);
          }
        );
        
      } else {
        console.error('No se pudo obtener el token. El usuario no está autenticado.');
      }
    }

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
  acceptInvitation(invitationId: number): void {
    if (this.token) {
      this.createTask.manageInvitation(invitationId, 'accept', this.token).subscribe(
        response => {
          console.log('Invitación aceptada:', response);
          this.removeInvitationFromList(invitationId);
        },
        error => {
          console.error('Error al aceptar la invitación:', error);
        }
      );
    }
  }

  
  rejectInvitation(invitationId: number): void {
    if (this.token) {
      this.createTask.manageInvitation(invitationId, 'reject', this.token).subscribe(
        response => {
          console.log('Invitación rechazada:', response);
          this.removeInvitationFromList(invitationId);
        },
        error => {
          console.error('Error al rechazar la invitación:', error);
        }
      );
    }
  }

  removeInvitationFromList(invitationId: number): void {
    this.pendingInvitations = this.pendingInvitations.filter(invitation => invitation.id !== invitationId);
    this.pendingInvitationCount = this.pendingInvitations.length; // Actualizar el contador de invitaciones
  }

  // Abrir y cerrar el modal de invitaciones
  openInvitationModal(): void {
    this.isInvitationModalOpen = true;
  }

  closeInvitationModal() {
    this.isInvitationModalOpen = false;
  }

  // Manejo del modal de tareas
  openTaskModal(tarea: any): void {
    this.selectedTask = tarea;
    this.isTaskModalOpen = true;

    this.taskUpdateForm.patchValue({
      avance: tarea.avance || '',
    });
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.selectedTask = null;
  }

  showTaskDetail(tarea: any) {
    this.selectedTask = tarea;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toggleInvitations() {
    this.isInvitationModalOpen = !this.isInvitationModalOpen;
  }


 // user-view.component.ts
 enviarAvance(): void {
    if (this.taskUpdateForm.invalid) {
      alert('Por favor, selecciona un avance.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró el token. Por favor, inicia sesión.');
      return;
    }

    const avance = this.taskUpdateForm.get('avance')?.value;

    const avanceData: any = { avance };

    // Si el avance es "finalizada", añadir "estado: true"
    if (avance === 'finalizada') {
      avanceData.estado = true;
    }

    this.userService.updateTaskProgress(this.selectedTask.tarea.id, avanceData, token).subscribe(
      (response) => {
        alert('Estado de avance actualizado con éxito');
        console.log('Respuesta del servidor:', response);
        
        this.closeTaskModal();
      },
      (error) => {
        console.error('Error al actualizar el avance de la tarea:', error);
        alert('Hubo un error al actualizar el estado de avance');
      }
    );
  }


  
}


