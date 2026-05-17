import { Component, inject, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService)
  isLoggedIn = computed(() => this.authService.isAuthenticated())
  userName = computed(() => this.authService.currentUser()?.name ?? '')
}
