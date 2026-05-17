import { Injectable, signal } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, of, throwError } from 'rxjs'
import { User } from '../../shared/models/kpi.model'

const MOCK_USER: User = {
  id: '1',
  email: 'admin@facturation.dev',
  name: 'Admin',
  role: 'admin'
}

const MOCK_PASSWORD = 'admin123'
const USER_KEY = 'user'

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null)

  constructor(private router: Router) {
    this._restoreSession()
  }

  login(email: string, password: string): Observable<void> {
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      localStorage.setItem(USER_KEY, JSON.stringify(MOCK_USER))
      this.currentUser.set(MOCK_USER)
      return of(void 0)
    }
    return throwError(() => ({ error: { message: 'Email ou mot de passe incorrect' } }))
  }

  logout(): void {
    localStorage.removeItem(USER_KEY)
    this.currentUser.set(null)
    this.router.navigate(['/login'])
  }

  private _restoreSession(): void {
    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored) as User)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
  }
}
