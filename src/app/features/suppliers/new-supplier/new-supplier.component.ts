// src/app/features/suppliers/new-supplier/new-supplier.component.ts
import { Component, signal, OnInit } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { RouterLink, Router, ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { forkJoin } from 'rxjs'
import { SupplierService } from '../supplier.service'
import { CreateSupplierDto, SUPPLIER_CATEGORIES } from '../../../shared/models/supplier.model'
import { Country, Currency, PaymentTerm } from '../../../shared/models/client.model'

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
  selector: 'app-new-supplier',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './new-supplier.component.html',
  styleUrl: './new-supplier.component.scss'
})
export class NewSupplierComponent implements OnInit {

  form!: FormGroup
  readonly categories = SUPPLIER_CATEGORIES

  editMode      = signal(false)
  loading       = signal(false)
  configLoading = signal(true)
  formSubmitted = signal(false)
  errorMsg      = signal('')

  countries           = signal<Country[]>([])
  currencies          = signal<Currency[]>([])
  paymentTermsOptions = signal<PaymentTerm[]>([])

  get f() { return this.form.controls }

  private supplierId: string | null = null

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      companyName: ['', Validators.required],
      website:     ['', optionalUrl],
      category:    ['', Validators.required],
      fullName:    [''],
      email:       ['', Validators.email],
      phone:       ['', optionalPhone],
      street:      [''],
      city:        [''],
      postalCode:  [''],
      country:     [{ value: 'Tunisie', disabled: true }],
      taxId:       [''],
      currency:    [{ value: 'TND', disabled: true }],
      paymentTerms:[{ value: 'Net 30', disabled: true }],
    })

    this.supplierId = this.route.snapshot.paramMap.get('id')
    if (this.supplierId) {
      this.editMode.set(true)
      this.supplierService.getById(this.supplierId).subscribe({
        next: (supplier) => this.form.patchValue({
          companyName:  supplier.companyName,
          website:      supplier.website,
          category:     supplier.category,
          fullName:     supplier.contact.fullName,
          email:        supplier.contact.email,
          phone:        supplier.contact.phone,
          street:       supplier.address.street,
          city:         supplier.address.city,
          postalCode:   supplier.address.postalCode,
          country:      supplier.address.country,
          taxId:        supplier.financial.taxId,
          currency:     supplier.financial.currency,
          paymentTerms: supplier.financial.paymentTerms,
        }),
        error: () => this.router.navigate(['/suppliers'])
      })
    }

    forkJoin({
      countries:    this.supplierService.getCountries(),
      currencies:   this.supplierService.getCurrencies(),
      paymentTerms: this.supplierService.getPaymentTerms()
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
    const dto: CreateSupplierDto = {
      companyName: v.companyName,
      website:     v.website,
      category:    v.category,
      contact: {
        fullName: v.fullName,
        email:    v.email,
        phone:    v.phone
      },
      address: {
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
      ? this.supplierService.update(this.supplierId!, dto)
      : this.supplierService.create(dto)

    request$.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/suppliers']) },
      error: (e) => {
        this.errorMsg.set(e?.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
        this.loading.set(false)
      }
    })
  }

  cancel(): void {
    this.router.navigate(['/suppliers'])
  }
}
