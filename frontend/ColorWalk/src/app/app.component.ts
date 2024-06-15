import { Component } from '@angular/core';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
            RouterOutlet,
            WorldComponent,
            MatButtonModule,
            MatDialogModule,
            UiPaintingComponent,
            MatCardModule,
            LoginComponent,
             FloatingActionButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ColorWalk';
  constructor(private dialog: MatDialog, private router: Router) { }

  openPaintingDialog(): void {
    this.dialog.open(UiPaintingComponent, {
      width: '1600px',
      height: '600px'
    });
  }

  jumpToLogin(): void {
    this.router.navigate(['/login']);
  }
}
