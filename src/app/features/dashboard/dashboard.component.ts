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
  templateUrl: './dashboard.component.html'
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
