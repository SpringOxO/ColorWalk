import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  raindrops: any[] = [];
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router,private snackBar: MatSnackBar) { }

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

  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        if(response.message === 'success'){
          console.log('Login successful', response);
          // 处理登录成功（例如，保存 JWT token，重定向等）
          this.authService.log();
          this.router.navigate(['/whiteworld']); // 假设有一个 dashboard 路由
        }else{
          //弹出提示框：用户名或密码错误
          this.snackBar.open('用户名或密码错误', '关闭', {
            duration: 3000, // 提示框显示时间（毫秒）
            verticalPosition: 'top', // 提示框垂直位置
            horizontalPosition: 'center', // 提示框水平位置
          })
        }
        
      },
      error => {
        console.error('Login failed', error);
        // 处理登录失败
        this.snackBar.open('网络错误！', '关闭', {
          duration: 3000, // 提示框显示时间（毫秒）
          verticalPosition: 'top', // 提示框垂直位置
          horizontalPosition: 'center', // 提示框水平位置
        })
      }
    );
  }

  onRegister(): void {
    this.authService.register(this.username, this.password).subscribe(
      response => {
        console.log('Register successful', response);
        // 处理注册成功（例如，显示成功消息，重定向到登录页等）
        //this.router.navigate(['/login']); // 假设有一个 login 路由
        if(response.message === '用户已存在'){
          this.snackBar.open('用户已存在！', '关闭', {
          duration: 3000, // 提示框显示时间（毫秒）
          verticalPosition: 'top', // 提示框垂直位置
          horizontalPosition: 'center', // 提示框水平位置
        })
        }else if(response.message === 'success'){
          this.snackBar.open('注册成功！', '关闭', {
            duration: 3000, // 提示框显示时间（毫秒）
            verticalPosition: 'top', // 提示框垂直位置
            horizontalPosition: 'center', // 提示框水平位置
          })
        }
      },
      error => {
        console.log('Register failed', error);
        // 处理注册失败
        this.snackBar.open('网络错误！', '关闭', {
          duration: 3000, // 提示框显示时间（毫秒）
          verticalPosition: 'top', // 提示框垂直位置
          horizontalPosition: 'center', // 提示框水平位置
        })
      }
    );
  }
}