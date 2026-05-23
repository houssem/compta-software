import { Component, signal, computed, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { TranslateModule } from '@ngx-translate/core'

interface Industry { id: number; value: string; label: string }

interface RegistrationPayload {
  fullName: string
  email: string
  password: string
  company: {
    name: string
    vatNumber: string
    industry: string
    address: { streetNo: string; streetName: string; city: string; postalCode: string; country: string }
    logo: string
  }
  bank: { accountHolder: string; bankName: string; iban: string; swiftBic: string }
  status: 'pending'
  submittedAt: string
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private http   = inject(HttpClient)
  private router = inject(Router)

  currentStep   = signal<1 | 2 | 3 | 4>(1)
  formSubmitted = signal(false)

  // Step 1
  fullName        = signal('')
  email           = signal('')
  password        = signal('')
  confirmPassword = signal('')
  showPassword    = signal(false)
  showConfirm     = signal(false)

  // Step 2
  industries   = signal<Industry[]>([])
  companyName  = signal('')
  vatNumber    = signal('')
  industry     = signal('')
  streetNo     = signal('')
  streetName   = signal('')
  city         = signal('')
  postalCode   = signal('')
  country      = signal('')
  logoBase64   = signal('')
  logoFileName = signal('')

  // Step 3
  accountHolder = signal('')
  bankName      = signal('')
  iban          = signal('')
  swiftBic      = signal('')

  // Submission
  submitting   = signal(false)
  submitError  = signal('')

  readonly countries = [
    'France', 'Tunisie', 'United Kingdom', 'Germany', 'Spain', 'Italy',
    'Belgium', 'Switzerland', 'Netherlands', 'United States', 'Other'
  ]

  step1Valid = computed(() =>
    this.fullName().trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()) &&
    this.password().length >= 8 &&
    this.password() === this.confirmPassword()
  )

  step2Valid = computed(() =>
    this.companyName().trim().length > 0 &&
    this.industry().trim().length > 0 &&
    this.streetName().trim().length > 0 &&
    this.city().trim().length > 0 &&
    this.postalCode().trim().length > 0 &&
    this.country().trim().length > 0
  )

  step3Valid = computed(() =>
    this.accountHolder().trim().length > 0 &&
    this.bankName().trim().length > 0 &&
    this.iban().trim().length > 0 &&
    this.swiftBic().trim().length > 0
  )

  err = {
    fullName:        computed(() => this.formSubmitted() && !this.fullName().trim()),
    email:           computed(() => this.formSubmitted() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())),
    password:        computed(() => this.formSubmitted() && this.password().length < 8),
    confirmPassword: computed(() => this.formSubmitted() && this.password() !== this.confirmPassword()),
    companyName:     computed(() => this.formSubmitted() && !this.companyName().trim()),
    industry:        computed(() => this.formSubmitted() && !this.industry().trim()),
    streetName:      computed(() => this.formSubmitted() && !this.streetName().trim()),
    city:            computed(() => this.formSubmitted() && !this.city().trim()),
    postalCode:      computed(() => this.formSubmitted() && !this.postalCode().trim()),
    country:         computed(() => this.formSubmitted() && !this.country().trim()),
    accountHolder:   computed(() => this.formSubmitted() && !this.accountHolder().trim()),
    bankName:        computed(() => this.formSubmitted() && !this.bankName().trim()),
    iban:            computed(() => this.formSubmitted() && !this.iban().trim()),
    swiftBic:        computed(() => this.formSubmitted() && !this.swiftBic().trim()),
  }

  ngOnInit(): void {
    this.http.get<Industry[]>('/api/industries').subscribe({
      next: list => this.industries.set(list),
      error: () => {}
    })
  }

  next(): void {
    this.formSubmitted.set(true)
    const step = this.currentStep()
    const valid = step === 1 ? this.step1Valid() : step === 2 ? this.step2Valid() : this.step3Valid()
    if (!valid) return
    this.formSubmitted.set(false)
    if (step < 3) {
      this.currentStep.set((step + 1) as 2 | 3)
    } else {
      this.submit()
    }
  }

  prev(): void {
    const step = this.currentStep()
    if (step > 1) this.currentStep.set((step - 1) as 1 | 2)
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || file.size > 2 * 1024 * 1024) return
    this.logoFileName.set(file.name)
    const reader = new FileReader()
    reader.onload = e => this.logoBase64.set((e.target?.result as string) ?? '')
    reader.readAsDataURL(file)
  }

  maskedIban(): string {
    const v = this.iban().replace(/\s/g, '')
    return v.length < 8 ? v : v.slice(0, 4) + ' •••• •••• ' + v.slice(-3)
  }

  private submit(): void {
    this.submitting.set(true)
    this.submitError.set('')

    const payload: RegistrationPayload = {
      fullName: this.fullName(),
      email:    this.email(),
      password: this.password(),
      company: {
        name:      this.companyName(),
        vatNumber: this.vatNumber(),
        industry:  this.industry(),
        address: {
          streetNo:   this.streetNo(),
          streetName: this.streetName(),
          city:       this.city(),
          postalCode: this.postalCode(),
          country:    this.country()
        },
        logo: this.logoBase64()
      },
      bank: {
        accountHolder: this.accountHolder(),
        bankName:      this.bankName(),
        iban:          this.iban(),
        swiftBic:      this.swiftBic()
      },
      status:      'pending',
      submittedAt: new Date().toISOString()
    }

    this.http.post('/api/registrations', payload).subscribe({
      next:  () => { this.submitting.set(false); this.currentStep.set(4) },
      error: e  => {
        this.submitError.set(e?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
        this.submitting.set(false)
      }
    })
  }
}
