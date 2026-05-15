import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
      <div class="surface-card p-5 border-round shadow-2" style="width: 100%; max-width: 420px">
        <router-outlet />
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
