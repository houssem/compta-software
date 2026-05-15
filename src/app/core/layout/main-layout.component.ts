import { Component, computed } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="surface-card border-right-1 surface-border flex flex-column" style="width: 240px; flex-shrink: 0">
        <div class="p-4 border-bottom-1 surface-border">
          <span class="text-xl font-bold text-primary">Facturation</span>
        </div>
        <nav class="flex flex-column p-2 gap-1 flex-1">
          <a routerLink="/" routerLinkActive="surface-hover"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex align-items-center gap-2 p-3 border-round text-color no-underline hover:surface-hover cursor-pointer">
            <i class="pi pi-home"></i>
            <span>Accueil</span>
          </a>
          <a routerLink="/dashboard" routerLinkActive="surface-hover"
             class="flex align-items-center gap-2 p-3 border-round text-color no-underline hover:surface-hover cursor-pointer">
            <i class="pi pi-chart-bar"></i>
            <span>Tableau de bord</span>
          </a>
        </nav>
        <div class="p-3 border-top-1 surface-border">
          <p-button
            label="Déconnexion"
            icon="pi pi-sign-out"
            [text]="true"
            severity="secondary"
            styleClass="w-full"
            (onClick)="logout()" />
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex flex-column flex-1 overflow-hidden">
        <!-- Topbar -->
        <header class="surface-card border-bottom-1 surface-border flex align-items-center justify-content-end px-4" style="height: 56px; flex-shrink: 0">
          <span class="text-color-secondary text-sm">{{ userName() }}</span>
        </header>
        <main class="flex-1 overflow-auto p-4 surface-ground">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  userName = computed(() => this.authService.currentUser()?.name ?? '')

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout()
  }
}
