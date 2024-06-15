import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
            MatFormFieldModule,
            MatInputModule,
            MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  raindrops: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.generateRaindrops();
  }

  generateRaindrops(): void {
    for (let i = 0; i < 300; i++) {
      const width = Math.random() * 3 + 1;
      const posX = Math.floor(Math.random() * 100);
      const delay = Math.random() * -20;
      const duration = Math.random() * 5 + 2;
      const colorIndex = (i + 1) % 3;
      const color = colorIndex === 1 ? '#00f' : colorIndex === 2 ? '#f00' : '#0f0';

      this.raindrops.push({
        width: width + 'px',
        left: posX + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's',
        background: `linear-gradient(transparent, ${color})`
      });
    }
  }
}