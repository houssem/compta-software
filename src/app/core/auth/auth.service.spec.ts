import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthService]
    })
    service = TestBed.inject(AuthService)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('currentUser signal is null on init with no stored user', () => {
    expect(service.currentUser()).toBeNull()
  })

  it('login() with correct credentials stores user and updates signal', () => {
    let completed = false
    service.login('admin@facturation.dev', 'admin123').subscribe(() => {
      completed = true
    })
    expect(completed).toBeTrue()
    expect(localStorage.getItem('user')).not.toBeNull()
    expect(service.currentUser()?.email).toBe('admin@facturation.dev')
  })

  it('login() with wrong credentials emits error', () => {
    let errored = false
    service.login('wrong@example.com', 'badpass').subscribe({
      error: () => { errored = true }
    })
    expect(errored).toBeTrue()
    expect(service.currentUser()).toBeNull()
  })

  it('logout() removes user from localStorage and sets signal to null', () => {
    service.login('admin@facturation.dev', 'admin123').subscribe()
    service.logout()
    expect(localStorage.getItem('user')).toBeNull()
    expect(service.currentUser()).toBeNull()
  })

  it('_restoreSession() loads user from localStorage on init', () => {
    const user = { id: '1', email: 'admin@facturation.dev', name: 'Admin', role: 'admin' }
    localStorage.setItem('user', JSON.stringify(user))
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthService]
    })
    const fresh = TestBed.inject(AuthService)
    expect(fresh.currentUser()?.email).toBe('admin@facturation.dev')
  })
})
