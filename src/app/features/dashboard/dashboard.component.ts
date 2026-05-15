import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { DashboardService } from './dashboard.service'
import { DashboardSummary } from '../../shared/models/kpi.model'
import { KpiCardComponent } from './components/kpi-card.component'
import { RevenueChartComponent } from './components/revenue-chart.component'
import { StatusDonutComponent } from './components/status-donut.component'
import { ComparisonBarComponent } from './components/comparison-bar.component'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, CardModule, ProgressSpinnerModule,
    KpiCardComponent, RevenueChartComponent, StatusDonutComponent, ComparisonBarComponent
  ],
  template: `
    <h2 class="text-2xl font-bold text-color mt-0 mb-4">Tableau de bord</h2>

    @if (loading()) {
      <div class="flex justify-content-center align-items-center" style="height: 300px">
        <p-progressSpinner />
      </div>
    }

    @if (error()) {
      <div class="p-4 border-round bg-red-50 text-red-700">
        <i class="pi pi-exclamation-circle mr-2"></i>{{ error() }}
      </div>
    }

    @if (summary(); as data) {
      <!-- KPI Cards -->
      <div class="grid mb-4">
        <div class="col-12 sm:col-6 lg:col-3">
          <app-kpi-card
            title="Factures émises"
            [value]="data.kpis.invoicesCount.toString()"
            [variation]="data.kpis.invoicesCountVariation"
            variationUnit=""
            icon="pi-file"
            subtitle="vs mois précédent" />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <app-kpi-card
            title="Montant total HT"
            [value]="fmtCurrency(data.kpis.totalAmountHT)"
            [variation]="data.kpis.totalAmountVariation"
            variationUnit="%"
            icon="pi-euro"
            subtitle="ce mois" />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <app-kpi-card
            title="En attente"
            [value]="fmtCurrency(data.kpis.pendingAmount)"
            [variation]="data.kpis.pendingCount"
            variationUnit=" factures"
            icon="pi-clock"
            subtitle="en attente" />
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <app-kpi-card
            title="En retard"
            [value]="fmtCurrency(data.kpis.overdueAmount)"
            [variation]="data.kpis.overdueCount"
            variationUnit=" factures"
            icon="pi-exclamation-triangle"
            subtitle="en retard" />
        </div>
      </div>

      <!-- Charts -->
      <div class="grid">
        <div class="col-12 lg:col-8">
          <p-card header="Évolution du CA (12 mois)">
            <app-revenue-chart [series]="data.revenueSeries" />
          </p-card>
        </div>
        <div class="col-12 lg:col-4">
          <p-card header="Répartition par statut">
            <app-status-donut [distribution]="data.statusDistribution" />
          </p-card>
        </div>
        <div class="col-12">
          <p-card header="Facturé vs Encaissé">
            <app-comparison-bar [series]="data.comparisonSeries" />
          </p-card>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null)
  loading = signal(true)
  error = signal('')

  private currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  })

  fmtCurrency(value: number): string {
    return this.currencyFormatter.format(value)
  }

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Impossible de charger les données du tableau de bord.')
        this.loading.set(false)
      }
    })
  }
}
