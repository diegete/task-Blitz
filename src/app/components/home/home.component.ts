import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTasksService } from '../../services/create-tasks.service';
import { CommonModule } from '@angular/common';
import { CreateProyectService } from '../../services/create-proyect.service';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // envio de avance por parte de los empleados, investigar auth 2 factores 
  // inicio  variables
  userData: any;
  tareaup: any;
  taskForm: FormGroup;
  projectForm: FormGroup;
  assignTaskForm: FormGroup;
  taskUpdateForm: FormGroup;
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
  isMetricsModalOpen= false;
  isAssignTaskModalOpen = false;
  isTaskModalUpdateOpen = false;
  showTaskForm: boolean = false;
  metrics: any = null;
  selectedUser: any = null;
  isConfirmModalOpen = false;
  private proyectrefreshInterval: any;
  invitationForm: FormGroup;
  availableEmployees: any[] = [];
  isInvitationModalOpen = false;
  pimg: any;
  pimgd: any;
  showImageModal = false;
  selectedImage: File | null = null;
  token: string | null = null; 
  // fin varialbes 
  constructor(
    private userService: UserdataService,
    private taskService: CreateTasksService,
    private proyectService: CreateProyectService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    // Inicializar el formulario de creación de tareas
    this.taskForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      carga: [null, Validators.required],  // Valor numérico (5, 3, 1)
      proyecto: [null],
      fechaIncio: [Date, Validators.required],
      fechaMax: [Date, Validators.required]

    });    

    // Inicializar el formulario de creación de proyectos
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
    });

    // Inicializar el formulario para asignar tareas
    this.assignTaskForm = this.formBuilder.group({
      tarea: ['', Validators.required],
      miembro: ['' , Validators.required]
    });
    // Inicializar el formulario invitaciones
    this.invitationForm = this.formBuilder.group({
      invited_user: ['', Validators.required]
    });

    this.taskUpdateForm = this.formBuilder.group({
      id: ['',Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      carga: [null, Validators.required],
      proyecto: [null],
      fechaInicio: [Date, Validators.required],
      fechaMax: [Date, Validators.required]
    })

  }

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        this.ordenarProyectosPorPrioridad()
        this.get_task();
        let BACKEND_URL = 'http://localhost:8000';
        this.userData = data;
        let img;
        img = BACKEND_URL+this.userData.profile.image;
        this.pimg = img
        this.pimgd = BACKEND_URL+'/media/profile_images/defecto.jpg'
        this.userData.profile.image = img
      });
    } else {
      alert('No ha iniciado sesión')
      //console.log('No hay un usuario autenticado');
    }
    
    this.proyectrefreshInterval = setInterval(() => {
      //console.log('estan cargando')
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        this.ordenarProyectosPorPrioridad()
        this.get_task();
      });
    }, 5000);
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
    // console.log('abri')
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

  openMetricModal(){
    this.isMetricsModalOpen = true
  }
  closeMetricModal(){
    this.isMetricsModalOpen = false
  }
  openAssignTaskModal(): void {
    this.isAssignTaskModalOpen = true;
  }

  closeAssignTaskModal(): void {
    this.isAssignTaskModalOpen = false;
  }

  // nuevo modal de actulizar tareas
  openTaskEditModal(): void{
    this.isTaskModalUpdateOpen = true
  }
  closeTaskEditModal(): void{
    this.isTaskModalUpdateOpen = false
  }
  // barra de carga trabajadores
  getCargaPercentage(cargaTrabajo: number): number {
    // Calcula el porcentaje de carga con base en un máximo de 10.
    return (cargaTrabajo / 10) * 100;
  }
  openImageModal(): void {
    console.log(this.userData);
    this.showImageModal = true;
  }
  
  closeImageModal(): void {
    this.showImageModal = false;
  }
  
  logOut(){
    this.loginService.logout();
    alert('Ha cerrado sesión')
    this.router.navigate(['/login'])
  }

  onImageSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }
  // fixed ahora funciona como deberia 
  // En el componente
selectProject(proyecto: any): void {
  this.selectedProject = proyecto;
  this.selectedProjectTasks = this.userData.tareas.filter((tarea: any) => tarea.proyecto === proyecto.id);
  
  // Restablece las selecciones y el formulario
  this.assignTaskForm.reset();
  this.selectedUser = null;

  const token = localStorage.getItem('token');
  const memberIds = proyecto.members.map((member: any) => member.id);

  // Obtener detalles de miembros
  if (token && memberIds.length > 0) {
    this.taskService.getMembersDetails(memberIds, token).subscribe(response => {
      this.selectedProject.members = response;
    });
  }

  // Obtener métricas del proyecto
  if (token) {
    this.proyectService.getProjectMetrics(proyecto.id, token).subscribe(metrics => {
      this.selectedProject.metrics = metrics; // Guardar métricas en el proyecto seleccionado
      //console.log(metrics)
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
          this.userService.getUserData().subscribe(data => {
            this.userData = data;
            this.ordenarProyectosPorPrioridad()
            this.get_task();
          });
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
    fechaInicio: this.taskForm.value.fechaIncio,
    fechamax: this.taskForm.value.fechaMax
  };
  
  if (token && this.taskForm.value.fechaIncio != null && this.taskForm.value.fechaMax !=null) {
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
      this.taskForm.reset();
      this.closeTaskModal();
      alert('Se ha creado la tarea con éxito');
    });
  }else{
    alert('Por favor, complete todos los campos y seleccione una fecha de inicio y fin');
  }
}



  get_task(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.taskService.gettask(token).subscribe(response => {
        this.userData.tareas = response.tareas;
        // console.log('Tareas obtenidas:', this.userData.tareas); // Verifica que el id está presente
      });
    }
  }
  
  selectTask(tarea: any): void {
  // Asignar el ID de la tarea seleccionada al formulario
  this.assignTaskForm.patchValue({
    tarea: tarea.id  
  });
  this.taskUpdateForm.patchValue({
    id: tarea.id  
  });
  this.tareaup = tarea
  //console.log('Tarea seleccionada:', tarea); // Verifica que el id está presente
}

  

assignTask(): void {
  const token = localStorage.getItem('token');

  console.log('Datos del formulario antes de enviar:', this.assignTaskForm.value);

  if (this.assignTaskForm.valid) {
    const assignData = {
      tarea: this.assignTaskForm.value.tarea, // Debería ser el id de la tarea
      miembro: this.assignTaskForm.value.miembro
    };

    if (token) {
      this.taskService.asignarTask(assignData, token).subscribe(
        response => {
          console.log('Tarea asignada:', response);

          // Encuentra la tarea asignada y usa su carga
          const tareaAsignada = this.selectedProjectTasks.find(t => t.id === assignData.tarea);
          const miembro = this.selectedProject.members.find((m: { id: any }) => m.id === assignData.miembro);

          if (tareaAsignada && miembro) {
            const cargaTarea = Number(tareaAsignada.carga) || 0; // Asegúrate de que la carga sea un número
            const cargaActual = Number(miembro.profile.cargaTrabajo) || 0; // Conversión a número seguro

            miembro.profile.cargaTrabajo = cargaActual + cargaTarea; // Suma correcta de la carga
            console.log(`Nueva carga para ${miembro.username}: ${miembro.profile.cargaTrabajo}`);
          }

          // Marcar la tarea como asignada
          const tareaIndex = this.selectedProjectTasks.findIndex(t => t.id === assignData.tarea);
          if (tareaIndex !== -1) {
            this.selectedProjectTasks[tareaIndex].asignada = true;
          }

          this.closeAssignTaskModal();
          this.closeConfirmModal();
          alert('Se ha asignado la tarea con éxito.');
        },
        error => {
          console.error('Error al asignar la tarea:', error);

          if (error.error?.error === "Asignación excede la carga máxima permitida.") {
            alert('No se pudo asignar la tarea: la carga máxima del trabajador ha sido excedida.');
          } else {
            alert('Ocurrió un error al asignar la tarea. Inténtalo nuevamente.');
          }
        }
      );
    }
  } else {
    alert('Formulario inválido. Asegúrate de seleccionar una tarea y un miembro.');
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
          console.log(this.selectedProject.members)
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

  updateTask() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('No se encontró el token. Por favor, inicia sesión.');
      return;
    }
  
    const tarea = {
      id: this.taskUpdateForm.value.id,
      titulo: this.taskUpdateForm.value.titulo,
      descripcion: this.taskUpdateForm.value.descripcion,
      carga: this.taskUpdateForm.value.carga,
      proyecto: this.selectedProject.id,
      fechaInicio: this.taskUpdateForm.value.fechaInicio,  // Corrección de nombre
      fechaMax: this.taskUpdateForm.value.fechaMax         // Corrección de nombre
    };
    if (!tarea.titulo || !tarea.descripcion || !tarea.carga || !tarea.fechaInicio || !tarea.fechaMax || !tarea.proyecto){
      this.taskService.updateTask(tarea, token).subscribe(
        (response) => {
          alert('Tarea actualizada con éxito');
          console.log(tarea)
          const index = this.selectedProjectTasks.findIndex(t => t.id === tarea.id);
          if (index !== -1) {
            this.selectedProjectTasks[index] = tarea; // Actualizar la tarea en la lista
          }
          this.closeTaskEditModal()
        },
        (error) => {
          console.error('Error al actualizar la tarea:', error);
          console.log(tarea)
          alert('Hubo un error al actualizar la tarea');
        }
      );
    }else{
      alert('No se encontró la tarea a actualizar')
    }


  }
  updateProfile(): void {
    const formData = new FormData();
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
      
    }
    this.token = localStorage.getItem('token')
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

  goLogin(){
    this.router.navigate(['/login'])
  }
  getCircularProgress(progress: number): string {
    return `conic-gradient(#4caf50 0% ${progress}%, #e0e0e0 ${progress}% 100%)`;
  }

  // exportToExcel() {
  //   const metrics = this.selectedProject.metrics;
  
  //   // Datos generales del proyecto
  //   const data = [
  //     { Métrica: 'Total de Tareas', Valor: metrics.total_tasks },
  //     { Métrica: 'Tareas Completadas', Valor: metrics.completed_tasks },
  //     { Métrica: 'Tareas en Progreso', Valor: metrics.inprogress_tasks },
  //     { Métrica: 'Progreso (%)', Valor: metrics.progress },
  //   ];
  
  //   // Agregar métricas por miembro
  //   this.selectedProject.members.forEach((member: any) => {
  //     data.push({
  //       Métrica: `Carga de ${member.username}`,
  //       Valor: member.profile.cargaTrabajo > 0 ? member.profile.cargaTrabajo : 'No especificada',
  //     });
  //   });
  
  //   // Crear hoja de Excel
  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Métricas');
  
  //   // Exportar archivo
  //   XLSX.writeFile(workbook, `metricas_proyecto_${this.selectedProject.title}.xlsx`);
  // }
  
  
  exportToPDF() {
    const doc = new jsPDF();
    const metrics = this.selectedProject.metrics;
  
    // Obtener la fecha actual
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`; // Formato: DD/MM/YYYY
  
    // Título
    doc.text('Métricas del Proyecto', 14, 20);
  
    // Agregar la fecha
    doc.text(`Fecha: ${formattedDate}`, 14, 30);
  
    // Datos generales
    const tableData = [
      ['Total de Tareas', metrics.total_tasks],
      ['Progreso (%)', `${metrics.progress}%`],
    ];
  
    // Agregar los nombres de las tareas en progreso, completadas, no asignadas y atrasadas
    const inProgressTasks = metrics.inprogress_task_names.length > 0 ? metrics.inprogress_task_names.join(', ') : 'Ninguna';
    const completedTasks = metrics.completed_task_names.length > 0 ? metrics.completed_task_names.join(', ') : 'Ninguna';
    const noAssignedTasks = metrics.no_assigned_task_names.length > 0 ? metrics.no_assigned_task_names.join(', ') : 'Ninguna';
    const atrasadas = metrics.overdue_task_names.length > 0 ? metrics.overdue_task_names.join(', ') : 'Ninguna';
  
    tableData.push(
      ['Tareas en Progreso', inProgressTasks],
      ['Tareas Completadas', completedTasks],
      ['Tareas Sin Asignar', noAssignedTasks],
      ['Tareas Atrasadas', atrasadas],
    );
  
    // Agregar detalles de las asignaciones de tareas
    if (metrics.assigned_task_details.length > 0) {
      metrics.assigned_task_details.forEach((task: any) => {
        tableData.push([
          `Tarea: ${task.tarea}`,
          `Asignada a: ${task.usuario || 'No asignada'}`,
        ]);
      });
    } else {
      tableData.push(['Tareas Asignadas', 'No hay tareas asignadas']);
    }
  ;

  
    // Agregar tabla con autoTable
    (doc as any).autoTable({
      head: [['Métrica', 'Valor']],
      body: tableData,
      startY: 40, // Ajustar para que no se sobreponga con la fecha
    });
  
    // Guardar el PDF
    doc.save(`metricas_proyecto_${this.selectedProject.title}.pdf`);
  }
  
  
  
  



  getPrioridadTexto(prioridad: number): string {
    switch (prioridad) {
      case 1:
        return 'Baja';
      case 3:
        return 'Media';
      case 5:
        return 'Alta';
      default:
        return 'Desconocida'; // Opcional: manejar casos fuera de rango
    }
  }
  
}