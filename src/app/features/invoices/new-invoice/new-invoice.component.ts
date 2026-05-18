import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'

interface LineItem {
  id: number
  description: string
  qty: number
  priceHT: number
  discPct: number
  vatPct: number
}

@Component({
  selector: 'app-new-invoice',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './new-invoice.component.html',
  styleUrl: './new-invoice.component.scss'
})
export class NewInvoiceComponent {
  clientName = signal('')
  invoiceNumber = signal('FAC-2026-0043')
  issueDate = signal('2026-05-12')
  dueDate = signal('2026-06-12')
  currency = signal('EUR')
  language = signal('FR')
  internalNotes = signal('')
  termsAndConditions = signal('Payment is due within 30 days. Late payments are subject to a 5% monthly fee.')
  lastSaved = signal('Just now')

  private nextId = 3
  lineItems = signal<LineItem[]>([
    { id: 1, description: 'Strategic consulting', qty: 1, priceHT: 2500, discPct: 0, vatPct: 20 },
    { id: 2, description: 'Cloud setup',          qty: 45, priceHT: 12,  discPct: 10, vatPct: 20 }
  ])

  vatRates = [0, 5.5, 10, 20]
  currencies = ['EUR', 'USD', 'GBP', 'CHF']
  languages = ['FR', 'EN', 'DE', 'ES']

  lineTotal(item: LineItem): number {
    const base = item.qty * item.priceHT
    const afterDisc = base * (1 - item.discPct / 100)
    return afterDisc
  }

  totalHT = computed(() =>
    this.lineItems().reduce((sum, item) => sum + this.lineTotal(item), 0)
  )

  vatBreakdown = computed(() => {
    const map = new Map<number, number>()
    for (const item of this.lineItems()) {
      const ht = this.lineTotal(item)
      const vat = ht * (item.vatPct / 100)
      map.set(item.vatPct, (map.get(item.vatPct) ?? 0) + vat)
    }
    return Array.from(map.entries()).map(([rate, amount]) => ({ rate, amount }))
  })

  totalVAT = computed(() =>
    this.vatBreakdown().reduce((sum, v) => sum + v.amount, 0)
  )

  totalTTC = computed(() => this.totalHT() + this.totalVAT())

  addItem(): void {
    this.lineItems.update(items => [
      ...items,
      { id: this.nextId++, description: '', qty: 1, priceHT: 0, discPct: 0, vatPct: 20 }
    ])
  }

  removeItem(id: number): void {
    this.lineItems.update(items => items.filter(i => i.id !== id))
  }

  updateItem(id: number, field: keyof LineItem, value: string | number): void {
    this.lineItems.update(items =>
      items.map(i => i.id === id ? { ...i, [field]: value } : i)
    )
  }

  formatAmount(value: number): string {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  }

  save(): void {
    this.lastSaved.set('Just now')
  }

  sendByEmail(): void {
    // TODO: wire to email service
  }

  preview(): void {
    // TODO: open preview
  }
}
