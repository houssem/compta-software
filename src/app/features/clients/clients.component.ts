import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

type FactureStatus = 'en-attente' | 'a-jour' | 'retard'

interface Client {
  id: number
  nom: string
  contact: string
  email: string
  facturesCount: number
  factureStatus: FactureStatus
  soldeDu: number
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  searchQuery = signal('')
  currentPage = signal(1)
  readonly pageSize = 6
  readonly totalClients = 1248
  readonly nouveaux30j = 42
  readonly soldeGlobalDu = 124500.00

  readonly allClients: Client[] = [
    { id: 1,  nom: 'Acme Dynamics Ltd.',       contact: 'Jean-Pierre Dupont', email: 'jp.dupont@acme.com',           facturesCount: 3, factureStatus: 'en-attente', soldeDu: 12450.00 },
    { id: 2,  nom: 'Global Logistics SARL',     contact: 'Marie Lefebvre',     email: 'm.lefebvre@global-log.fr',     facturesCount: 0, factureStatus: 'a-jour',     soldeDu: 0 },
    { id: 3,  nom: 'Solaris Energy Systems',    contact: 'Marc Antoine',       email: 'm.antoine@solaris.net',        facturesCount: 1, factureStatus: 'retard',     soldeDu: 4880.00 },
    { id: 4,  nom: 'Innovatech Group',          contact: 'Sophie Laurent',     email: 'sophie.l@innovatech.com',      facturesCount: 5, factureStatus: 'en-attente', soldeDu: 21300.50 },
    { id: 5,  nom: "Bureau d'études Durand",    contact: 'Alain Durand',       email: 'contact@durand-etude.fr',      facturesCount: 0, factureStatus: 'a-jour',     soldeDu: 0 },
    { id: 6,  nom: 'Creative Pixel Studio',     contact: 'Lucas Meyer',        email: 'lucas@pixel-studio.io',        facturesCount: 2, factureStatus: 'retard',     soldeDu: 1240.00 },
    { id: 7,  nom: 'DataCloud Solutions',       contact: 'Claire Bernard',     email: 'c.bernard@datacloud.io',       facturesCount: 4, factureStatus: 'en-attente', soldeDu: 9870.00 },
    { id: 8,  nom: 'Horizon Ventures',          contact: 'Éric Fontaine',      email: 'e.fontaine@horizon.fr',        facturesCount: 0, factureStatus: 'a-jour',     soldeDu: 0 },
    { id: 9,  nom: 'Nexus Consulting',          contact: 'Isabelle Moreau',    email: 'i.moreau@nexus-consulting.fr', facturesCount: 2, factureStatus: 'retard',     soldeDu: 3350.75 },
    { id: 10, nom: 'Groupe Énergie SA',         contact: 'Thomas Petit',       email: 't.petit@groupe-energie.fr',    facturesCount: 1, factureStatus: 'en-attente', soldeDu: 6100.00 },
    { id: 11, nom: 'Swift Logistique',          contact: 'Nathalie Simon',     email: 'n.simon@swift-log.fr',         facturesCount: 0, factureStatus: 'a-jour',     soldeDu: 0 },
    { id: 12, nom: 'Allo Pub SARL',             contact: 'Kevin Martin',       email: 'k.martin@allopub.fr',          facturesCount: 3, factureStatus: 'en-attente', soldeDu: 7600.25 },
  ]

  filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase()
    if (!q) return this.allClients
    return this.allClients.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  })

  totalPages = computed(() => Math.ceil(this.filteredClients().length / this.pageSize))

  pagedClients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize
    return this.filteredClients().slice(start, start + this.pageSize)
  })

  pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filteredClients().length)
  )

  pageStart = computed(() => (this.currentPage() - 1) * this.pageSize + 1)

  visiblePages = computed(() => {
    const total = this.totalPages()
    const current = this.currentPage()
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
  })

  onSearchChange(val: string): void {
    this.searchQuery.set(val)
    this.currentPage.set(1)
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page)
    }
  }

  formatAmount(value: number): string {
    return '€' + value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}
