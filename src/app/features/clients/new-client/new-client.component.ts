import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-new-client',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss'
})
export class NewClientComponent {
  companyName    = signal('')
  reference      = signal('CUST-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000))
  website        = signal('')

  fullName       = signal('')
  email          = signal('')
  phone          = signal('')

  street         = signal('')
  city           = signal('')
  postalCode     = signal('')
  country        = signal('France')

  taxId          = signal('')
  currency       = signal('EUR')
  paymentTerms   = signal('Net 30')

  readonly countries = [
    'France', 'United Kingdom', 'Germany', 'Spain', 'Italy',
    'Belgium', 'Switzerland', 'Netherlands', 'United States', 'Other'
  ]

  readonly currencies = [
    { value: 'EUR', label: 'EUR (€) – Euro' },
    { value: 'GBP', label: 'GBP (£) – British Pound' },
    { value: 'USD', label: 'USD ($) – US Dollar' },
    { value: 'CHF', label: 'CHF – Swiss Franc' },
  ]

  readonly paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immédiat']

  constructor(private router: Router) {}

  save(): void {
    // TODO: wire to client service
    this.router.navigate(['/customers'])
  }

  cancel(): void {
    this.router.navigate(['/customers'])
  }
}
