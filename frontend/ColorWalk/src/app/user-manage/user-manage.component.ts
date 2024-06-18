import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    MatCardModule
  ],
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.css']
})
export class UserManageComponent implements OnInit {
  raindrops: any[] = [];
  displayedColumns: string[] = ['username', 'region', 'delete'];
  dataSource: any[] = [];

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.generateRaindrops();
    this.loadData();
  }

  generateRaindrops(): void {
    for (let i = 0; i < 80; i++) {
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

  loadData(): void {
    if (this.authService.getUsername() !== 'admin') {
      this.getUserInfo();
    } else {
      this.getAllUserInfo();
    }
  }

  getUserInfo(): void {
    this.authService.getMyInfo(this.authService.getUsername()).subscribe(
      response => {
        console.log(response);
        this.dataSource = [{ username: response.username, region: response.zonepassed }];
      },
      error => {
        this.snackBar.open('Error loading user info', '关闭', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    );
  }

  getAllUserInfo(): void {
    this.authService.getAllInfo().subscribe(
      response => {
        this.dataSource = response.map((user: { username: any; zonepassed: any; }) => ({
          username: user.username,
          region: user.zonepassed
        }));
        console.log(this.dataSource);
      },
      error => {
        this.snackBar.open('Error loading user list', '关闭', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    );
  }

  deleteUser(username: string): void {
    if (username == 'admin') {
      this.snackBar.open('无法注销admin！', '关闭', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }
    this.authService.deleteUser(username).subscribe(
      response => {
        console.log(response);
        if (response.message === '用户不存在') {
          this.snackBar.open('用户不存在！', '关闭', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        } else {
          this.snackBar.open('注销成功！', '关闭', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          this.loadData();
          if (username == localStorage.getItem('username')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }

      },
      error => {
        this.snackBar.open('Error deleting user', '关闭', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    );
  }
}