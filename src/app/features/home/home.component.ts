import { Component, inject, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CardModule, ButtonModule],
  template: `
    <div class="mb-5">
      <h1 class="text-3xl font-bold text-color m-0">Bonjour, {{ userName() }}</h1>
      <p class="text-color-secondary mt-2">Bienvenue dans votre module de facturation.</p>
    </div>

    <div class="grid">
      <div class="col-12 md:col-6 lg:col-4">
        <p-card>
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-3 p-4 pb-0">
              <div class="flex align-items-center justify-content-center border-round surface-100" style="width: 48px; height: 48px">
                <i class="pi pi-chart-bar text-xl text-primary"></i>
              </div>
              <span class="font-semibold text-lg">Tableau de bord</span>
            </div>
          </ng-template>
          <p class="text-color-secondary text-sm m-0">Visualisez la santé financière de votre activité.</p>
          <ng-template pTemplate="footer">
            <p-button label="Ouvrir" icon="pi pi-arrow-right" [text]="true" routerLink="/dashboard" />
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class HomeComponent {
  private authService = inject(AuthService)
  userName = computed(() => this.authService.currentUser()?.name ?? 'Utilisateur')
}
