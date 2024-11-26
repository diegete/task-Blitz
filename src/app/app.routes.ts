import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { UserViewComponent } from './components/user-view/user-view.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

export const routes: Routes = [
    { path: '', component: LoginComponent},
    {path: 'home', component:HomeComponent},
    {path: 'login', component:LoginComponent},
    {path: 'user-view', component:UserViewComponent},
    { path: 'auth/password-reset', component: PasswordResetComponent },
    { path: 'auth/password-reset/:token', component: ChangePasswordComponent }

    
];
