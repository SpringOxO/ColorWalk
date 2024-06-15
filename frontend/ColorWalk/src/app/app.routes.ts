import { Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: '', component: WorldComponent},
    {path: 'login', component: LoginComponent}
];
 
