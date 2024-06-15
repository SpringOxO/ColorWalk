import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorldComponent } from './world/world.component';
import { FloatingActionButtonComponent } from './floating-action-button/floating-action-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WorldComponent, FloatingActionButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ColorWalk';
}
