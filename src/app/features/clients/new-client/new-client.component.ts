import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ClientService } from '../client.service'
import { CreateClientDto } from '../../../shared/models/client.model'

@Component({
  selector: 'app-new-client',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss'
})
export class NewClientComponent {
  companyName    = signal('')
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

  loading        = signal(false)
  errorMsg       = signal('')

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

  constructor(
    private router: Router,
    private clientService: ClientService
  ) {}

  save(): void {
    this.loading.set(true)
    this.errorMsg.set('')

    const dto: CreateClientDto = {
      companyName: this.companyName(),
      website: this.website(),
      contact: {
        fullName: this.fullName(),
        email: this.email(),
        phone: this.phone()
      },
      billingAddress: {
        street: this.street(),
        city: this.city(),
        postalCode: this.postalCode(),
        country: this.country()
      },
      financial: {
        taxId: this.taxId(),
        currency: this.currency() as 'EUR' | 'GBP' | 'USD' | 'CHF',
        paymentTerms: this.paymentTerms() as 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Immédiat'
      }
    }

    this.clientService.create(dto).subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (e) => {
        this.errorMsg.set(e?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
        this.loading.set(false)
      }
    })
  }

  cancel(): void {
    this.router.navigate(['/customers'])
  }
}
