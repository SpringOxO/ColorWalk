import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

interface Message {
  role: 'user' | 'system';
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent {
  userInput: string = '';
  messages: Message[] = [];
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userInput.trim()) return;
  
    const userMessage: Message = { role: 'user', content: this.userInput };
    this.messages.push(userMessage);
    this.userInput = '';
  
    const apiUrl = '/ai/compatible-mode/v1/chat/completions';
    const apiKeyBase64 = 'c2stNjU5ODA5MmZhZmVmNDJhMjkwNjdkNmM4ZWQ3YjQwNzU=';
    const apiKey = atob(apiKeyBase64);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });
  
    // 确保消息数组中的消息按照用户消息和助手消息的顺序交替出现
    const messages: Message[] = [
      { role: 'system', content: 'You are an expert in art history and famous paintings.' }
    ];
    for (let i = 0; i < this.messages.length; i += 2) {
      messages.push(this.messages[i]);
      if (i + 1 < this.messages.length) {
        messages.push(this.messages[i + 1]);
        //console.log(messages);
      }
    }
  
    const body = {
      "model": "qwen-long",
      "messages": messages
    };
  
    this.loading = true;
    this.http.post(apiUrl, body, { headers }).subscribe(
      (response: any) => {
        const aiMessage: Message = { role: 'system', content: response.choices[0].message.content };
        this.messages.push(aiMessage);
        this.loading = false;
      },
      (error) => {
        console.error(error);
        const errorMessage: Message = { role: 'system', content: 'Error: Unable to fetch response' };
        this.messages.push(errorMessage);
        this.loading = false;
      }
    );
  }
}