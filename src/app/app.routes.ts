import { Routes } from '@angular/router'
import { authGuard } from './core/auth/auth.guard'
import { MainLayoutComponent } from './core/layout/main-layout.component'

export const routes: Routes = [
  // Landing page — standalone, no layout wrapper
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  // Login page — standalone, full-page Stitch design
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  // Authenticated area — sidebar layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
]
