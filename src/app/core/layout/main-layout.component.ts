import { Component, computed } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  userName = computed(() => this.authService.currentUser()?.name ?? '')

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout()
  }
}
