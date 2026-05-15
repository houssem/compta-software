import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { ButtonModule } from 'primeng/button'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputTextModule, PasswordModule, ButtonModule],
  template: `
    <div class="text-center mb-5">
      <div class="text-3xl font-bold text-primary mb-2">Facturation</div>
      <div class="text-color-secondary">Connectez-vous à votre espace</div>
    </div>

    <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="email" class="font-medium text-sm">Email</label>
          <input
            pInputText
            id="email"
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="admin@facturation.dev"
            class="w-full"
            required />
        </div>

        <div class="flex flex-column gap-2">
          <label for="password" class="font-medium text-sm">Mot de passe</label>
          <p-password
            inputId="password"
            [(ngModel)]="password"
            name="password"
            [feedback]="false"
            [toggleMask]="true"
            styleClass="w-full"
            inputStyleClass="w-full"
            required />
        </div>

        @if (errorMessage) {
          <div class="p-3 border-round bg-red-50 text-red-700 text-sm">
            <i class="pi pi-exclamation-circle mr-2"></i>{{ errorMessage }}
          </div>
        }

        <p-button
          type="submit"
          label="Se connecter"
          icon="pi pi-sign-in"
          styleClass="w-full"
          [loading]="loading"
          [disabled]="!email || !password" />
      </div>
    </form>
  `
})
export class LoginComponent {
  email = ''
  password = ''
  errorMessage = ''
  loading = false

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true
    this.errorMessage = ''
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false
        this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        this.loading = false
        this.errorMessage = err.error?.message ?? 'Une erreur est survenue'
      }
    })
  }
}
