import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTasksService } from '../../services/create-tasks.service';
import { CommonModule } from '@angular/common';
import { CreateProyectService } from '../../services/create-proyect.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // actualización de tareas, envio de avance por parte de los empleados, investigar auth 2 factores 
  // inicio  variables
  userData: any;
  taskForm: FormGroup;
  projectForm: FormGroup;
  assignTaskForm: FormGroup;
  proyectoData: any;
  proyect = {
    title: '',
    owner: '',
    members: [],
  }
  selectedProject: any = null;
  selectedProjectTasks: any[] = [];
  isProjectModalOpen = false;
  isTaskModalOpen = false;
  isAssignTaskModalOpen = false;
  showTaskForm: boolean = false;

  selectedUser: any = null;
  isConfirmModalOpen = false;

  invitationForm: FormGroup;
  availableEmployees: any[] = [];
  isInvitationModalOpen = false;


  // fin varialbes 
  constructor(
    private userService: UserdataService,
    private taskService: CreateTasksService,
    private proyectService: CreateProyectService,
    private formBuilder: FormBuilder,
  ) {
    // Inicializar el formulario de creación de tareas
    this.taskForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      carga: [null, Validators.required],  // Valor numérico (5, 3, 1)
      proyecto: [null],
      fechaIncio: [Date, Validators.required],
      fecha: [Date, Validators.required]

    });    

    // Inicializar el formulario de creación de proyectos
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
    });

    // Inicializar el formulario para asignar tareas
    this.assignTaskForm = this.formBuilder.group({
      tarea: ['', Validators.required],
      miembro: ['', Validators.required]
    });
    // Inicializar el formulario invitaciones
    this.invitationForm = this.formBuilder.group({
      invited_user: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        this.ordenarProyectosPorPrioridad()
        this.get_task();
      });
    } else {
      console.log('No hay un usuario autenticado');
    }
    
  }
  // modal configs
  // Método para seleccionar/deseleccionar un usuario

  toggleSelectUser(user: any): void {
    this.selectedProject.members.forEach((miembro: any) => miembro.selected = false); // Desmarcar todos
    user.selected = true; // Marcar el usuario seleccionado
    this.selectedUser = user;
  
    // Asignar el miembro seleccionado al formulario
    this.assignTaskForm.patchValue({
      miembro: user.id  // Asegurarse de usar el id o la propiedad adecuada del usuario
    });
  }
  

    closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
  }

  openProjectModal(): void {
    console.log('abri')
    this.isProjectModalOpen = true;
  }

  closeProjectModal(): void {
    this.isProjectModalOpen = false;
  }

  openTaskModal(): void {
    this.isTaskModalOpen = true;
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
  }

  openAssignTaskModal(): void {
    this.isAssignTaskModalOpen = true;
  }

  closeAssignTaskModal(): void {
    this.isAssignTaskModalOpen = false;
  }

  // fixed ahora funciona como deberia 
  selectProject(proyecto: any): void {
    this.selectedProject = proyecto;
    this.selectedProjectTasks = this.userData.tareas.filter((tarea: any) => tarea.proyecto === proyecto.id);

    // Restablecer la tarea seleccionada al cambiar de proyecto
    this.assignTaskForm.reset();  // Restablece el formulario de asignación de tareas
    this.selectedUser = null;  // Desmarca cualquier usuario seleccionado

    const token = localStorage.getItem('token');
    console.log(proyecto.members); // Verifica la estructura completa de los miembros

    // Ahora que el ID está incluido, se puede acceder directamente
    const memberIds = proyecto.members.map((member: any) => member.id); 
    console.log(memberIds); // Verifica los IDs extraídos

    if (token && memberIds.length > 0) {
      this.taskService.getMembersDetails(memberIds, token).subscribe(response => {
        // Actualizamos los miembros con la información recibida del backend
        this.selectedProject.members = response;
      });
    }
}
  
  
  

  crearProyecto(): void {
    const token = localStorage.getItem('token');
    if (this.projectForm.value.title) {
      this.proyect.title = this.projectForm.value.title;
      this.proyect.owner = this.userData.username;
  
      if (token) {
        this.proyectService.createProyect(this.proyect, token).subscribe(response => {
          alert('se ha creado el proyecto');
          this.closeProjectModal();
        });
      }
    }
  }
// agregar mensaje de se ha creado tarea y cerrar modal
createTask(): void {
  const token = localStorage.getItem('token');
  let taskData = {
    titulo: this.taskForm.value.titulo,
    descripcion: this.taskForm.value.descripcion,
    carga: this.taskForm.value.carga,  // El valor numérico 5, 3 o 1
    proyecto: this.selectedProject.id,
    fechamax: this.taskForm.value.fecha
  };
  
  if (token) {
    this.taskService.createTask(taskData, token).subscribe((response: any) => {
      // Añadir la nueva tarea al array local de tareas
      const nuevaTarea = {
        id: response.id,
        titulo: taskData.titulo,
        descripcion: taskData.descripcion,
        carga: taskData.carga,
        proyecto: taskData.proyecto,
        asignada: false
      };
      
      // Actualizar la lista de tareas del proyecto seleccionado
      this.selectedProjectTasks.push(nuevaTarea);

      this.closeTaskModal();
      alert('Se ha creado la tarea con éxito');
    });
  }
}



  get_task(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.taskService.gettask(token).subscribe(response => {
        this.userData.tareas = response.tareas;
        console.log('Tareas obtenidas:', this.userData.tareas); // Verifica que el id está presente
      });
    }
  }
  
  selectTask(tarea: any): void {
  // Asignar el ID de la tarea seleccionada al formulario
  this.assignTaskForm.patchValue({
    tarea: tarea.id  
  });
  console.log('Tarea seleccionada:', tarea); // Verifica que el id está presente
}

  

assignTask(): void {
  const token = localStorage.getItem('token');

  console.log('Datos del formulario antes de enviar:', this.assignTaskForm.value);
  if (this.assignTaskForm.valid) {
    const assignData = {
      tarea: this.assignTaskForm.value.tarea,  // Debería ser el id de la tarea
      miembro: this.assignTaskForm.value.miembro
    };

    if (token) {
      this.taskService.asignarTask(assignData, token).subscribe(response => {
        console.log('Tarea asignada:', response);

        // Encuentra la tarea asignada en el array y márcala como tachada
        const tareaIndex = this.selectedProjectTasks.findIndex(t => t.id === assignData.tarea);
        if (tareaIndex !== -1) {
          this.selectedProjectTasks[tareaIndex].asignada = true; // Suponiendo que 'asignada' es la propiedad que indica que la tarea está completada/asignada
        }

        this.closeAssignTaskModal();
        this.closeConfirmModal();
        alert('se ha asignado la tarea');
      });
    }
  } else {
    alert('Formulario inválido. Asegúrate de seleccionar una tarea y un miembro.')
  }
}


  

   // Método para confirmar la asignación de tareas
   confirmAssign(): void {
    if (this.selectedUser) {
      this.isConfirmModalOpen = true;
    } else {
      alert('Seleccione un usuario para asignar la tarea.');
    }
  }
  
  
  // invitaciones 
  getAvailableEmployees(): void {
    const token = localStorage.getItem('token');
    if (token && this.selectedProject) {
      this.taskService.getAvailableEmployees(this.selectedProject.id, token).subscribe(
        (response) => {
          
          this.availableEmployees = response; // Asignar la lista de empleados disponibles
          console.log(this.availableEmployees)
        },
        (error) => {
          console.error('Error al obtener empleados disponibles:', error);
        }
      );
    }
  }


  openInvitationModal(): void {
    this.isInvitationModalOpen = true;
    this.getAvailableEmployees(); // Obtener empleados disponibles al abrir el modal
  }

  closeInvitationModal(): void {
    this.isInvitationModalOpen = false;
  }
  // arreglar
  sendInvitation(): void {
    const token = localStorage.getItem('token');
    const invitationData = {
      proyecto: this.selectedProject.id,
      invited_user: this.invitationForm.value.invited_user
    };

    if (token) {
      this.taskService.sendInvitation(invitationData, token).subscribe(
        (response) => {
          alert('Invitación enviada con éxito');
          this.closeInvitationModal();
        },
        (error) => {
          console.error('Error al enviar la invitación:', error);
          alert('Hubo un error al enviar la invitación');
        }
      );
    }
  }
  actualizarPrioridad(proyecto: any) {
    const token = localStorage.getItem('token');
    if (token){
      this.proyectService.actualizarPrioridad(proyecto.id, Number(proyecto.prioridad) ,token).subscribe(
        () => {
          alert('se ha cambiado la prioridad')
          this.ordenarProyectosPorPrioridad()
        },
        error => {
          console.error('Error al actualizar la prioridad', error);
        }
      );
    }
    
  }
  ordenarProyectosPorPrioridad() {
    this.userData.proyectos.sort((a: any, b: any) => b.prioridad - a.prioridad);
  }

  
}
