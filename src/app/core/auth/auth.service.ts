import { Injectable, signal, inject } from '@angular/core'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { User } from '../../shared/models/kpi.model'

interface Registration {
  id: number
  fullName: string
  email: string
  password: string
  status: string
}

const USER_KEY = 'user'

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null)
  private http = inject(HttpClient)
  private router = inject(Router)

  constructor() {
    this._restoreSession()
  }

  login(email: string, password: string): Observable<void> {
    return this.http.get<Registration[]>(`/api/registrations?email=${encodeURIComponent(email)}`).pipe(
      switchMap(results => {
        const match = results.find(r => r.email === email && r.password === password)
        if (!match) {
          return throwError(() => ({ error: { message: 'Email ou mot de passe incorrect' } }))
        }
        const user: User = {
          id: String(match.id),
          email: match.email,
          name: match.fullName,
          role: 'user'
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        this.currentUser.set(user)
        return of(void 0)
      })
    )
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
