import { Component } from '@angular/core';
import { UserdataService } from '../../services/userdata.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTasksService } from '../../services/create-tasks.service';
import { CommonModule } from '@angular/common';
import { CreateProyectService } from '../../services/create-proyect.service';

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
  projectForm: FormGroup;
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
  showTaskForm: boolean = false;
  
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
      carga: [null, Validators.required],
      proyecto: [null]
    });



    // Inicializar el formulario de creación de proyectos
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      // owner: ['', [Validators.required]], esto esta para futuras mejoras 
      // members: ['',[Validators.required]]  
    })
  }


  // validación de usuario logeado y validaciones
  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        this.get_task();
        console.log('Datos del usuario:', this.userData.proyectos);  // se verifica que exitan los datos

      });
    } else {
      console.log('No hay un usuario autenticado');
    }
  }





openProjectModal(): void {
  this.isProjectModalOpen = true;
}

closeProjectModal(): void {
  this.isProjectModalOpen = false;
}

// Método para abrir y cerrar el modal de tareas
openTaskModal(): void {
  this.isTaskModalOpen = true;
}

closeTaskModal(): void {
  this.isTaskModalOpen = false;
}
    
  // Método para seleccionar un proyecto
  selectProject(proyecto: any): void {
    this.selectedProject = proyecto;
    this.selectedProjectTasks = this.userData.tareas.filter((tarea: any) => tarea.proyecto === proyecto.id);
    console.log('Tareas filtradas del proyecto seleccionado:', this.selectedProjectTasks);
  }
   // Metodo crear proyecto
  crearProyecto(): void {
    const token = localStorage.getItem('token');
 
    // Asegúrate de que los valores de title y userData.id existan antes de asignarlos
    if (this.projectForm.value.title) {
      this.proyect.title = this.projectForm.value.title;
      this.proyect.owner = this.userData.username; // Usa el ID del usuario autenticado

  
      console.log(this.proyect);  // Revisa que los valores se estén asignando correctamente
    
      if (token) {
        this.proyectService.createProyect(this.proyect, token).subscribe(response => {
          console.log('Proyecto creado:', response);
          alert('se ha creado el proyecto')
        }, error => {
          console.error('Error al crear el proyecto:', error);
        });
      } else {
        console.error('No se encontró un token');
      }
    } else {
      console.error('No se encontraron datos válidos para el proyecto.');
    }
  }
    // Método para crear una tarea
    createTask(): void {
      const token = localStorage.getItem('token');
    
      let taskData = {
          titulo: this.taskForm.value.titulo,
          descripcion: this.taskForm.value.descripcion,
          carga: this.taskForm.value.carga,
          proyecto: this.selectedProject.id
      };
    
      console.log('Datos que se enviarán:', taskData);
    
      if (token) {
          this.taskService.createTask(taskData, token).subscribe(response => {
              console.log('Tarea creada:', response);
              this.get_task(); // Volver a cargar las tareas
          }, error => {
              console.error('Error al crear la tarea:', error);
          });
      } else {
          console.error('No se encontró un token');
      }
  }

  get_task(): void {
    const token = localStorage.getItem('token');
  
    if (token) {
      this.taskService.gettask(token).subscribe(response => {
        console.log('Tareas obtenidas:', response);  // Aquí recibes la lista de tareas
        // Asigna las tareas obtenidas a una variable si necesitas mostrarlas
        this.userData.tareas = response.tareas;
      }, error => {
        console.error('Error al obtener las tareas:', error);
      });
    } else {
      console.error('No se encontró un token');
    }
  }
  
  
}
