import { Routes } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { LoginComponent } from './login/login.component';
import { WhiteWorldComponent } from './white-world/white-world.component';
import { AuthGuard } from './auth.guard';
import { AppComponent } from './app.component';
import { AiChatComponent } from './ai-chat/ai-chat.component';


export const routes: Routes = [
    {path: '', component: WorldComponent},
    {path: 'login', component: LoginComponent},
    { path: 'world', component: WorldComponent, canActivate: [AuthGuard] },
    { path: 'whiteworld', component: WhiteWorldComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: AiChatComponent }
];
 
