import { Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { LoginComponent } from './login/login.component';
import { WhiteWorldComponent } from './white-world/white-world.component';

export const routes: Routes = [
    {path: '', component: WorldComponent},
    {path: 'login', component: LoginComponent},
    {path: 'world', component: WorldComponent},
    {path: 'whiteworld', component: WhiteWorldComponent}
];
 
