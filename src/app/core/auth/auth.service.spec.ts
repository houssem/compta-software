import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { AuthService } from './auth.service'

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `${header}.${body}.fake-sig`
}

describe('AuthService', () => {
  let service: AuthService
  let httpMock: HttpTestingController

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    })
    service = TestBed.inject(AuthService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
    localStorage.clear()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('isAuthenticated() returns false when no token in localStorage', () => {
    expect(service.isAuthenticated()).toBeFalse()
  })

  it('currentUser signal is null on init with no token', () => {
    expect(service.currentUser()).toBeNull()
  })

  it('login() stores token and updates currentUser signal', () => {
    const token = makeJwt({
      id: '1', email: 'admin@facturation.dev', name: 'Admin', role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    let completed = false

    service.login('admin@facturation.dev', 'password123').subscribe(() => {
      completed = true
    })

    const req = httpMock.expectOne('/api/auth/login')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({ email: 'admin@facturation.dev', password: 'password123' })
    req.flush({ token })

    expect(completed).toBeTrue()
    expect(localStorage.getItem('token')).toBe(token)
    expect(service.isAuthenticated()).toBeTrue()
    expect(service.currentUser()?.email).toBe('admin@facturation.dev')
  })

  it('logout() clears token and sets currentUser to null', () => {
    localStorage.setItem('token', 'some-token')
    service.logout()
    expect(localStorage.getItem('token')).toBeNull()
    expect(service.currentUser()).toBeNull()
  })

  it('isAuthenticated() returns false for expired token', () => {
    const expiredToken = makeJwt({ id: '1', exp: Math.floor(Date.now() / 1000) - 10 })
    localStorage.setItem('token', expiredToken)
    expect(service.isAuthenticated()).toBeFalse()
  })
})
