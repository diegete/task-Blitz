import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { CreateTasksService } from '../../services/create-tasks.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { CsrfService } from '../../services/csrf.service';


@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css'
})
export class UserViewComponent {
  userData: any = null; 
  // img actulizar
  selectedImage: File | null = null;
  //
  selectedProject: any = null; 
  selectedProjectTasks: any[] = []; 
  selectedTask: any = null;
  isTaskModalOpen = false;
  showImageModal = false;
  isModalOpen = false;
  pendingInvitations: any[] = [];
  token: string | null = null;  // Variable para almacenar el token
  isInvitationModalOpen = false; // Controla la apertura del modal de invitaciones
  pendingInvitationCount = 0;
  showInvitations: boolean = false;
  taskUpdateForm: FormGroup;
  //CHAT
  pimg: any;
  pimgd: any;
  chatMessages: any[] = [];
  newMessage: string = '';
  private chatRefreshInterval: any;
  private invitationfreshInterval: any;
  isChatOpen = false;
  notifications: any[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserdataService, 
    private loginService: LoginService, 
    private createTask: CreateTasksService,
    private formBuilder: FormBuilder,
    private router:Router,
    private notificationService: CsrfService,
    ) {
      this.taskUpdateForm = this.formBuilder.group({
        avance: ['', Validators.required],
      });
    }
    
    ngOnInit(): void {
      if (this.userService.isLoggedIn()) {
        this.userService.getUserData().subscribe(data => {
           let BACKEND_URL = 'http://localhost:8000';
          this.userData = data;
          let img;
          img = BACKEND_URL+this.userData.profile.image;
          this.pimg = img
          this.pimgd = BACKEND_URL+'/media/profile_images/defecto.jpg'
          this.userData.profile.image = img
          //console.log(this.pimg, this.pimgd)
          this.loadPendingInvitations();
          this.loadNotifications();
          this.invitationfreshInterval = setInterval(() => {
            console.log('estan cargando')
            this.loadPendingInvitations();
            
          }, 5000);
          
          
        });
  
        // Configurar el intervalo para actualizar los mensajes del chat cada 2 segundos
       
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
            this.chatMessages = []; // Limpiar el chat
             // Cargar mensajes del proyecto seleccionado
             this.chatRefreshInterval = setInterval(() => {
              if (this.selectedProject) {
                this.loadMessages();
                this.loadPendingInvitations()
              }
            }, 5000);
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
          this.userService.getUserData().subscribe(data => {
            this.userData = data;
            this.loadPendingInvitations();} // recarga de datos por invitación aceptada.
          
      )},
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
  openChat(): void{
    if (this.selectedProject) {
      this.isChatOpen = true;
      this.loadMessages();
    } else {
      alert("Selecciona un proyecto primero.");
    }
  }
  closeChat(): void{
    this.isChatOpen = false;
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

  openImageModal(): void {
    //console.log('Modal abierto');
    this.showImageModal = true;
  }
  
  closeImageModal(): void {
    this.showImageModal = false;
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
        //console.log('Respuesta del servidor:', response);
        console.log(this.selectedTask)
        this.closeTaskModal();
      },
      (error) => {
        console.error('Error al actualizar el avance de la tarea:', error);
        alert('Hubo un error al actualizar el estado de avance');
      }
    );
  }

 // chat
 loadMessages(): void {
  if (this.token) {
    this.chatService.getMessages(this.selectedProject.id, this.token).subscribe(
      messages => {
      //console.log('Mensajes recibidos del backend:', messages);  // Log para verificar la respuesta de la API
        this.chatMessages = messages;
      },
      error => console.error('Error al cargar mensajes:', error)
    );
  } else {
    console.error('Token no disponible. El usuario no está autenticado.');
  }
}

sendMessage(): void {
  if (this.newMessage.trim() && this.token) {
    this.chatService.sendMessage(this.selectedProject.id, this.newMessage, this.token).subscribe(
      message => {
        this.chatMessages.push(message);  // Agregar el mensaje a la lista localmente
        this.newMessage = '';  // Limpiar el campo de entrada
        
      },
      error => console.error('Error al enviar mensaje:', error)
    );
  } else if (!this.token) {
    console.error('Token no disponible. El usuario no está autenticado.');
  }
}

onImageSelected(event: any): void {
  this.selectedImage = event.target.files[0];
}
updateProfile(): void {
  const formData = new FormData();
  if (this.selectedImage) {
    formData.append('image', this.selectedImage);
    
  }

  if (this.token) {
    this.userService.updateProfile(formData, this.token).subscribe(
      response => {
        //console.log('Perfil actualizado con éxito', response);
        alert('Perfil actualizado con éxito')
        this.userService.getUserData().subscribe(data => {
          this.userData = data;
          let BACKEND_URL = 'http://localhost:8000';
          this.userData = data; 
          let img;
          img = BACKEND_URL+this.userData.profile.image;
          this.pimg = img
          this.pimgd = BACKEND_URL+'/media/profile_images/defecto.jpg'
          this.userData.profile.image = img
          
        })
        // Aquí puedes actualizar `profileData` o mostrar un mensaje de éxito
      },
      error => {
        console.error('Error al actualizar el perfil', error);
      }
    );
  } else {
    console.error('Token no disponible. El usuario no está autenticado.');
  }
}

logOut(){
  this.loginService.logout()
  alert('Ha cerrardo su sesión')
  this.router.navigate(['/login'])
}

goLogin(){
  this.router.navigate(['/login'])
}

loadNotifications(): void {
  if(this.token){
    this.notificationService.getNotifications(this.token).subscribe((data) => {
      this.notifications = data;
    });
  }else{
    console.log('No hay token')
  }

}

markAsRead(notificationId: number): void {
  if(this.token){
    this.notificationService.markAsRead(notificationId,this.token).subscribe(() => {
      this.notifications = this.notifications.filter(
        (n) => n.id !== notificationId
      );
    });
  }else{
    alert('No tienes permiso para realizar esta acción')
  }
  
}
get nonCompletedTasks() {
  return this.selectedProjectTasks?.filter(tarea => tarea.tarea.estado === false) || [];
}
}


