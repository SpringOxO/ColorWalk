import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { FloatingActionButtonComponent } from './floating-action-button/floating-action-button.component';
import { UiPaintingComponent } from './ui-painting/ui-painting.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WorldComponent,
    MatButtonModule,
    MatDialogModule,
    UiPaintingComponent,
    MatCardModule,
    LoginComponent,
    FloatingActionButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ColorWalk';
  showPainting = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
  ) { }

  onOpenPainting(): void {
    this.showPainting = !this.showPainting;
  }
  
  onClosePainting(): void {
    this.showPainting = false;
  }

  jumpToLogin(): void {
    if(!this.authService.isLoggedIn){
      this.router.navigate(['/login']);
    }else{
      
    }
    
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 't' || event.key === 'T') {
      this.onOpenPainting();
    }
  }
}