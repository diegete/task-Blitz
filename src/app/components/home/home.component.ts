import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserdataService } from '../../services/userdata.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userData: any;

  constructor(private userService: UserdataService) {}

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.getUserData().subscribe(data => {
        this.userData = data;
        console.log('Datos del usuario:', this.userData);
      });
    } else {
      console.log('No hay un usuario autenticado');
    }
  }
 
  
}
