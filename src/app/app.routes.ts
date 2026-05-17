import { Routes } from '@angular/router'
import { authGuard } from './core/auth/auth.guard'
import { MainLayoutComponent } from './core/layout/main-layout.component'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard-vente',
        loadComponent: () =>
          import('./features/dashboard-vente/dashboard-vente.component').then(m => m.DashboardVenteComponent)
      },
      { path: 'dashboard', redirectTo: 'dashboard-vente' }
    ]
  },
  { path: '**', redirectTo: '' }
]
