import { Component, computed, signal, OnInit, inject, HostListener } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router, ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { forkJoin } from 'rxjs'
import { Currency } from '../../../shared/models/client.model'
import { Supplier } from '../../../shared/models/supplier.model'
import { PurchaseInvoiceService } from '../purchase-invoice.service'
import { LineItem, StoredPurchaseInvoice, PurchaseInvoiceStatus } from '../../../shared/models/purchase-invoice.model'

@Component({
  selector: 'app-new-purchase-invoice',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './new-purchase-invoice.component.html',
  styleUrl: './new-purchase-invoice.component.scss'
})
export class NewPurchaseInvoiceComponent implements OnInit {

  private http    = inject(HttpClient)
  private router  = inject(Router)
  private route   = inject(ActivatedRoute)
  private service = inject(PurchaseInvoiceService)

  editMode = signal(false)
  private invoiceDbId: string | null = null

  invoiceNumber = signal(this.genInvoiceNumber())
  issueDate     = signal(this.dateOffset(0))
  dueDate       = signal(this.dateOffset(30))
  currency      = signal('TND')
  internalNotes = signal('')
  status        = signal<PurchaseInvoiceStatus>('reçue')

  allSuppliers      = signal<Supplier[]>([])
  selectedSupplier  = signal<Supplier | null>(null)
  supplierSearch    = signal('')
  supplierModalOpen = signal(false)

  filteredSupplierOptions = computed(() => {
    const q = this.supplierSearch().toLowerCase().trim()
    if (!q) return this.allSuppliers()
    return this.allSuppliers().filter(s =>
      s.companyName.toLowerCase().includes(q) ||
      s.contact.fullName.toLowerCase().includes(q) ||
      s.contact.email.toLowerCase().includes(q)
    )
  })

  currencies    = signal<Currency[]>([])
  configLoading = signal(true)

  private nextId = 1
  lineItems = signal<LineItem[]>([])
  vatRates  = [0, 7, 13, 19]

  formSubmitted = signal(false)
  saving        = signal(false)
  saveError     = signal('')

  isFormValid = computed(() =>
    !!this.selectedSupplier() &&
    !!this.issueDate() &&
    !!this.dueDate() &&
    this.lineItems().length > 0 &&
    this.lineItems().every(i => i.description.trim() !== '' && i.qty > 0 && i.priceHT >= 0)
  )

  lineTotal    = (item: LineItem) => item.qty * item.priceHT * (1 - item.discPct / 100)
  totalHT      = computed(() => this.lineItems().reduce((s, i) => s + this.lineTotal(i), 0))
  vatBreakdown = computed(() => {
    const map = new Map<number, number>()
    for (const item of this.lineItems()) {
      const vat = this.lineTotal(item) * (item.vatPct / 100)
      map.set(item.vatPct, (map.get(item.vatPct) ?? 0) + vat)
    }
    return Array.from(map.entries()).map(([rate, amount]) => ({ rate, amount }))
  })
  totalVAT = computed(() => this.vatBreakdown().reduce((s, v) => s + v.amount, 0))
  totalTTC = computed(() => this.totalHT() + this.totalVAT())

  supplierError  = computed(() => this.formSubmitted() && !this.selectedSupplier())
  issueDateError = computed(() => this.formSubmitted() && !this.issueDate())
  dueDateError   = computed(() => this.formSubmitted() && !this.dueDate())
  noItemsError   = computed(() => this.formSubmitted() && this.lineItems().length === 0)
  itemDescError  = (item: LineItem) => this.formSubmitted() && !item.description.trim()
  itemQtyError   = (item: LineItem) => this.formSubmitted() && item.qty <= 0
  itemPriceError = (item: LineItem) => this.formSubmitted() && item.priceHT < 0

  @HostListener('document:keydown.escape')
  onEscape() { this.supplierModalOpen.set(false) }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) { this.editMode.set(true); this.invoiceDbId = id }

    const config$ = forkJoin({
      currencies: this.http.get<Currency[]>('/api/currencies'),
      suppliers:  this.http.get<Supplier[]>('/api/suppliers'),
    })

    if (this.editMode()) {
      forkJoin({ config: config$, invoice: this.service.getById(id!) }).subscribe({
        next: ({ config: { currencies, suppliers }, invoice }) => {
          this.currencies.set(currencies)
          this.allSuppliers.set(suppliers)
          this.configLoading.set(false)
          this.patchFromInvoice(invoice, suppliers)
        },
        error: () => this.router.navigate(['/purchase-invoices'])
      })
    } else {
      config$.subscribe({
        next: ({ currencies, suppliers }) => {
          this.currencies.set(currencies)
          this.allSuppliers.set(suppliers)
          this.configLoading.set(false)
        },
        error: () => this.configLoading.set(false)
      })
    }
  }

  private patchFromInvoice(inv: StoredPurchaseInvoice, suppliers: Supplier[]): void {
    this.invoiceNumber.set(inv.invoiceNumber)
    this.issueDate.set(inv.issueDate)
    this.dueDate.set(inv.dueDate)
    this.currency.set(inv.currency)
    this.internalNotes.set(inv.internalNotes ?? '')
    this.status.set(inv.status)
    const maxId = Math.max(0, ...inv.lineItems.map(i => i.id))
    this.nextId = maxId + 1
    this.lineItems.set(inv.lineItems)
    this.selectedSupplier.set(suppliers.find(s => s.id === inv.supplierId) ?? null)
  }

  private dateOffset(days: number): string {
    const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]
  }

  private genInvoiceNumber(): string {
    const year = new Date().getFullYear()
    return `ACH-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  }

  openSupplierModal(): void  { this.supplierSearch.set(''); this.supplierModalOpen.set(true) }
  closeSupplierModal(): void { this.supplierModalOpen.set(false) }

  selectSupplier(supplier: Supplier): void {
    this.selectedSupplier.set(supplier)
    this.supplierModalOpen.set(false)
    if (!this.editMode() && supplier.financial.currency) this.currency.set(supplier.financial.currency)
  }

  clearSupplier(event: MouseEvent): void { event.stopPropagation(); this.selectedSupplier.set(null) }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  addItem(): void {
    this.lineItems.update(items => [...items, { id: this.nextId++, description: '', qty: 1, priceHT: 0, discPct: 0, vatPct: 19 }])
  }
  removeItem(id: number): void { this.lineItems.update(items => items.filter(i => i.id !== id)) }
  updateItem(id: number, field: keyof LineItem, value: string | number): void {
    this.lineItems.update(items => items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  formatAmount(value: number): string {
    const symbol = this.currencies().find(c => c.value === this.currency())?.symbol ?? this.currency()
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + symbol
  }

  save(): void {
    this.formSubmitted.set(true)
    if (!this.isFormValid()) return
    this.saving.set(true)
    this.saveError.set('')

    const payload = {
      supplierId:    this.selectedSupplier()!.id,
      supplierName:  this.selectedSupplier()!.companyName,
      invoiceNumber: this.invoiceNumber(),
      issueDate:     this.issueDate(),
      dueDate:       this.dueDate(),
      currency:      this.currency(),
      lineItems:     this.lineItems(),
      internalNotes: this.internalNotes(),
      totalHT:       this.totalHT(),
      totalTTC:      this.totalTTC(),
      status:        this.status(),
      createdAt:     new Date().toISOString(),
    }

    const req$ = this.editMode()
      ? this.service.update(this.invoiceDbId!, payload)
      : this.service.create(payload)

    req$.subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/purchase-invoices']) },
      error: (e) => { this.saveError.set(e?.error?.message ?? 'Une erreur est survenue.'); this.saving.set(false) }
    })
  }
}
