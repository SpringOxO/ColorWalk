import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient) {
        this.loggedIn = localStorage.getItem('loggedIn') === 'true';
    }

    private loggedIn = false;
    private username = '';

    setUsername(username: string): void {
        this.username = username;
        localStorage.setItem('username', username);
    }

    getUsername(): string {
        return localStorage.getItem('username') || '';
    }

    isLoggedIn(): boolean {
        return this.loggedIn;
    }

    log(): void {
        this.loggedIn = true;
        localStorage.setItem('loggedIn', 'true');
    }

    logout(): void {
        this.loggedIn = false;
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
    }

    register(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, { username, password });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
    }

    getAllInfo(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/getuserlist`, {});
    }

    getMyInfo(username: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/getownuser`, {
            username: username
        });
    }

    increaseZonePassed(username: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/increment`, {
            username: username
        });
    }

    deleteUser(username: string): Observable<any> {
        const options = {
            body: { username: username }
        };
        return this.http.delete<any>(`${this.apiUrl}/delete`, options);
    }
}