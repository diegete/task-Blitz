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
  //

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
      carga: [Number, Validators.required],
      proyecto: [null, Validators.required],  // Asegúrate de que este campo esté aquí
    });



    // Inicializar el formulario de creación de proyectos
    this.projectForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      // owner: ['', [Validators.required]],
      // members: ['',[Validators.required]]
    })
  }


  // validación de usuario logeado y validaciones
  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        console.log('Datos del usuario:', this.userData.proyectos);  // Asegúrate de que userData tiene un ID

      });
    } else {
      console.log('No hay un usuario autenticado');
    }
  }



  // Método para crear una tarea
  createTask(): void {
    const token = localStorage.getItem('token');
  
    let taskData = {
        titulo: this.taskForm.value.titulo,
        descripcion: this.taskForm.value.descripcion,
        carga: this.taskForm.value.carga,
        proyecto: parseInt(this.taskForm.value.proyecto, 10),  // Convertir a número entero
    };
  
    console.log('Datos que se enviarán:', taskData);
  
    if (token) {
        this.taskService.createTask(taskData, token).subscribe(response => {
            console.log('Tarea creada:', response);
        }, error => {
            console.error('Error al crear la tarea:', error);
        });
    } else {
        console.error('No se encontró un token');
    }
}
  
  

   
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
  
}
