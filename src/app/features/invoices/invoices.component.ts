import { Component, computed, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

type InvoiceStatus = 'overdue' | 'paid' | 'pending' | 'approved' | 'draft' | 'sent'

interface Invoice {
  id: string
  client: string
  initial: string
  avatarColor: string
  dateFacture: string
  echeance: string
  montantTTC: number
  statut: InvoiceStatus
  echeanceOverdue?: boolean
}

interface Activity {
  dot: 'green' | 'amber'
  text: string
  sub: string
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent {
  searchQuery = signal('')
  statusFilter = signal<InvoiceStatus | ''>('')
  currentPage = signal(1)
  readonly pageSize = 5

  readonly statusLabels: Record<InvoiceStatus, string> = {
    overdue:  'Overdue',
    paid:     'Paid',
    pending:  'Pending Approval',
    approved: 'Approved',
    draft:    'Draft',
    sent:     'Sent',
  }

  readonly allInvoices: Invoice[] = [
    { id: 'FAC-2023-089', client: 'DataCloud Solutions',  initial: 'D', avatarColor: '#3B82F6', dateFacture: '12 Oct 2023', echeance: '12 Nov 2023', montantTTC: 1250.00, statut: 'overdue',  echeanceOverdue: true },
    { id: 'FAC-2023-090', client: 'Office Supplies Co.',  initial: 'O', avatarColor: '#10B981', dateFacture: '01 Dec 2023', echeance: '31 Dec 2023', montantTTC:  452.10, statut: 'paid' },
    { id: 'FAC-2023-091', client: 'Swift Logistique',     initial: 'S', avatarColor: '#F59E0B', dateFacture: '15 Dec 2023', echeance: '15 Jan 2024', montantTTC: 2800.00, statut: 'pending' },
    { id: 'FAC-2023-092', client: 'Allo Pub SARL',        initial: 'A', avatarColor: '#6366F1', dateFacture: '18 Dec 2023', echeance: '18 Jan 2024', montantTTC: 1100.00, statut: 'approved' },
    { id: 'FAC-2023-093', client: 'Maintenance Pro',      initial: 'M', avatarColor: '#94A3B8', dateFacture: '20 Dec 2023', echeance: '20 Jan 2024', montantTTC:  890.00, statut: 'draft' },
    { id: 'FAC-2023-094', client: 'TechCorp Dynamics',    initial: 'T', avatarColor: '#EC4899', dateFacture: '22 Dec 2023', echeance: '22 Jan 2024', montantTTC: 3400.00, statut: 'sent' },
    { id: 'FAC-2023-095', client: 'Réseau Digital',       initial: 'R', avatarColor: '#14B8A6', dateFacture: '28 Dec 2023', echeance: '28 Jan 2024', montantTTC:  760.00, statut: 'paid' },
    { id: 'FAC-2024-001', client: 'Groupe Énergie SA',    initial: 'G', avatarColor: '#F97316', dateFacture: '03 Jan 2024', echeance: '03 Feb 2024', montantTTC: 5200.00, statut: 'pending' },
    { id: 'FAC-2024-002', client: 'Nexus Consulting',     initial: 'N', avatarColor: '#8B5CF6', dateFacture: '05 Jan 2024', echeance: '05 Feb 2024', montantTTC: 1875.50, statut: 'approved' },
    { id: 'FAC-2024-003', client: 'Horizon Ventures',     initial: 'H', avatarColor: '#0EA5E9', dateFacture: '07 Jan 2024', echeance: '07 Feb 2024', montantTTC: 3100.00, statut: 'overdue', echeanceOverdue: true },
  ]

  filteredInvoices = computed(() => {
    const q = this.searchQuery().toLowerCase()
    const s = this.statusFilter()
    return this.allInvoices.filter(inv => {
      const matchesSearch = !q || inv.client.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)
      const matchesStatus = !s || inv.statut === s
      return matchesSearch && matchesStatus
    })
  })

  totalPages = computed(() => Math.ceil(this.filteredInvoices().length / this.pageSize))

  pagedInvoices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize
    return this.filteredInvoices().slice(start, start + this.pageSize)
  })

  pages = computed(() => {
    const total = this.totalPages()
    return Array.from({ length: total }, (_, i) => i + 1)
  })

  pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredInvoices().length)
  )

  // KPI values
  readonly totalAPayer   = 14280.50
  readonly recuesCount   = 8
  readonly enAttenteCount = 3
  readonly totalEnRetard = 3450.00

  readonly activities: Activity[] = [
    { dot: 'green', text: 'Paiement effectué pour <strong>Office supplies Co.</strong>', sub: 'Il y a 2 heures · Par Jean D.' },
    { dot: 'amber', text: 'Nouvelle facture importée : <strong>Swift Logistique</strong>', sub: 'Hier, 16:45 · Système OCR' },
  ]

  readonly statusOptions: { value: InvoiceStatus | '', label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'paid',     label: 'Paid' },
    { value: 'pending',  label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'overdue',  label: 'Overdue' },
    { value: 'draft',    label: 'Draft' },
    { value: 'sent',     label: 'Sent' },
  ]

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val)
    this.currentPage.set(1)
  }

  onStatusChange(val: string): void {
    this.statusFilter.set(val as InvoiceStatus | '')
    this.currentPage.set(1)
  }

  formatAmount(value: number): string {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  }
}
