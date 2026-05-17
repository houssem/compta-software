import { Component, computed, inject } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService)

  isLoggedIn = computed(() => this.authService.currentUser() !== null)
  userInitial = computed(() => {
    const name = this.authService.currentUser()?.name ?? ''
    return name.charAt(0).toUpperCase() || '?'
  })

  logout(): void {
    this.authService.logout()
  }
}
