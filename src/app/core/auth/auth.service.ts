import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, map, tap } from 'rxjs'
import { jwtDecode } from 'jwt-decode'
import { User } from '../../shared/models/kpi.model'

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null)

  constructor(private http: HttpClient, private router: Router) {
    this._restoreSession()
  }

  login(email: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>('/api/auth/login', { email, password }).pipe(
      tap(({ token }) => {
        localStorage.setItem('token', token)
        this.currentUser.set(jwtDecode<User>(token))
      }),
      map(() => void 0)
    )
  }

  logout(): void {
    localStorage.clear()
    this.currentUser.set(null)
    this.router.navigate(['/login'])
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    try {
      const { exp } = jwtDecode<{ exp: number }>(token)
      return exp > Math.floor(Date.now() / 1000)
    } catch {
      return false
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  private _restoreSession(): void {
    const token = this.getToken()
    if (token && this.isAuthenticated()) {
      try {
        this.currentUser.set(jwtDecode<User>(token))
      } catch {
        localStorage.clear()
      }
    }
  }
}
