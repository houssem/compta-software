import { Component, signal, computed, OnInit } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { RouterLink, Router, ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { forkJoin } from 'rxjs'
import { ClientService } from '../client.service'
import { CreateClientDto, Country, Currency, PaymentTerm } from '../../../shared/models/client.model'

// ── Custom validators (optional fields) ──────────────────────
function optionalUrl(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').trim()
  if (!v) return null
  return /^https?:\/\/.+\..+/.test(v) ? null : { invalidUrl: true }
}

function optionalPhone(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').trim()
  if (!v) return null
  return /^[+\d][\d\s\-(). ]{5,}$/.test(v) ? null : { invalidPhone: true }
}

@Component({
  selector: 'app-new-client',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss'
})
export class NewClientComponent implements OnInit {

  form!: FormGroup

  // UI state
  editMode      = signal(false)
  loading       = signal(false)
  configLoading = signal(true)
  formSubmitted = signal(false)
  errorMsg      = signal('')

  // Config from API
  countries           = signal<Country[]>([])
  currencies          = signal<Currency[]>([])
  paymentTermsOptions = signal<PaymentTerm[]>([])

  get f() { return this.form.controls }

  private clientId: string | null = null

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      companyName: ['', Validators.required],
      website:     ['', optionalUrl],
      fullName:    ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      phone:       ['', optionalPhone],
      street:      ['', Validators.required],
      city:        ['', Validators.required],
      postalCode:  ['', Validators.required],
      country:     [{ value: 'Tunisie', disabled: true }],
      taxId:       [''],
      currency:    [{ value: 'TND', disabled: true }],
      paymentTerms:[{ value: 'Net 30', disabled: true }],
    })

    // Detect edit mode from route param
    this.clientId = this.route.snapshot.paramMap.get('id')
    if (this.clientId) {
      this.editMode.set(true)
      this.clientService.getById(this.clientId).subscribe({
        next: (client) => this.form.patchValue({
          companyName:  client.companyName,
          website:      client.website,
          fullName:     client.contact.fullName,
          email:        client.contact.email,
          phone:        client.contact.phone,
          street:       client.billingAddress.street,
          city:         client.billingAddress.city,
          postalCode:   client.billingAddress.postalCode,
          country:      client.billingAddress.country,
          taxId:        client.financial.taxId,
          currency:     client.financial.currency,
          paymentTerms: client.financial.paymentTerms,
        }),
        error: () => this.router.navigate(['/customers'])
      })
    }

    // Load selects config
    forkJoin({
      countries:    this.clientService.getCountries(),
      currencies:   this.clientService.getCurrencies(),
      paymentTerms: this.clientService.getPaymentTerms()
    }).subscribe({
      next: ({ countries, currencies, paymentTerms }) => {
        this.countries.set(countries)
        this.currencies.set(currencies)
        this.paymentTermsOptions.set(paymentTerms)
        this.form.get('country')?.enable()
        this.form.get('currency')?.enable()
        this.form.get('paymentTerms')?.enable()
        this.configLoading.set(false)
      },
      error: () => {
        this.form.get('country')?.enable()
        this.form.get('currency')?.enable()
        this.form.get('paymentTerms')?.enable()
        this.configLoading.set(false)
      }
    })
  }

  save(): void {
    this.form.markAllAsTouched()
    this.formSubmitted.set(true)
    if (this.form.invalid) return

    this.loading.set(true)
    this.errorMsg.set('')

    const v = this.form.getRawValue()
    const dto: CreateClientDto = {
      companyName: v.companyName,
      website:     v.website,
      contact: {
        fullName: v.fullName,
        email:    v.email,
        phone:    v.phone
      },
      billingAddress: {
        street:     v.street,
        city:       v.city,
        postalCode: v.postalCode,
        country:    v.country
      },
      financial: {
        taxId:        v.taxId,
        currency:     v.currency,
        paymentTerms: v.paymentTerms
      }
    }

    const request$ = this.editMode()
      ? this.clientService.update(this.clientId!, dto)
      : this.clientService.create(dto)

    request$.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/customers']) },
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
