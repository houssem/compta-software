import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { AuthService } from './auth.service'
import { authGuard } from './auth.guard'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>
  let router: Router

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue(null)
    })
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    })
    router = TestBed.inject(Router)
  })

  it('returns true when authenticated', () => {
    (authServiceSpy.currentUser as jasmine.Spy).and.returnValue({ id: '1', email: 'test@test.com', name: 'Test', role: 'admin' })
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    )
    expect(result).toBeTrue()
  })

  it('returns UrlTree to /login when not authenticated', () => {
    (authServiceSpy.currentUser as jasmine.Spy).and.returnValue(null)
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    )
    expect(result).toEqual(router.createUrlTree(['/login']))
  })
})
