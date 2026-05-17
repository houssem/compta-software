import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { NgxEchartsModule } from 'ngx-echarts'
import type { EChartsOption } from 'echarts'
import { DashboardService } from '../dashboard/dashboard.service'
import { DashboardSummary } from '../../shared/models/kpi.model'

@Component({
  selector: 'app-dashboard-vente',
  standalone: true,
  imports: [NgxEchartsModule, RouterLink],
  templateUrl: './dashboard-vente.component.html',
  styleUrls: ['./dashboard-vente.component.scss']
})
export class DashboardVenteComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null)
  loading = signal(true)
  error = signal('')

  private destroyRef = inject(DestroyRef)

  revenueChartOptions: EChartsOption = {}
  donutChartOptions: EChartsOption = {}

  readonly statusData = [
    { label: 'Payée',      status: 'paid',    count: 78 },
    { label: 'En attente', status: 'pending', count: 18 },
    { label: 'En retard',  status: 'overdue', count: 12 },
  ]

  recentInvoices = signal([
    { number: 'INV-2023-089', client: 'Acme Corp Dynamics',  date: '24 oct. 2023', amount: '1 250,00 €', status: 'paid',    label: 'Payée' },
    { number: 'INV-2023-090', client: 'Global Logistics Ltd', date: '26 oct. 2023', amount: '840,00 €',   status: 'overdue', label: 'En retard' },
    { number: 'INV-2023-091', client: 'Horizon Ventures',     date: '27 oct. 2023', amount: '3 100,00 €', status: 'pending', label: 'En attente' }
  ])

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    const style = getComputedStyle(document.documentElement)
    const c = {
      border:           style.getPropertyValue('--color-border-subtle').trim(),
      onSurfaceVariant: style.getPropertyValue('--color-on-surface-variant').trim(),
      primary:          style.getPropertyValue('--color-primary').trim(),
      statusPaid:       style.getPropertyValue('--color-status-paid').trim(),
      statusPending:    style.getPropertyValue('--color-status-pending').trim(),
      statusOverdue:    style.getPropertyValue('--color-status-overdue').trim(),
      fontFamily:       style.getPropertyValue('--font-family').trim() || 'Inter, sans-serif',
    }

    this.revenueChartOptions = {
      grid: { top: 8, right: 8, bottom: 0, left: 8, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'],
        axisLine: { lineStyle: { color: c.border } },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, fontWeight: 600, color: c.onSurfaceVariant, fontFamily: c.fontFamily }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: c.border } },
        axisLabel: { fontSize: 11, color: c.onSurfaceVariant, fontFamily: c.fontFamily,
          formatter: (v: number) => `${(v / 1000).toFixed(0)}k` }
      },
      series: [{
        type: 'bar',
        // TODO: wire to summary()?.revenueSeries when API is live
        data: [3200, 4100, 3800, 3100, 4800, 4200, 3900, 5100, 4400, 4700, 5200, 4900],
        itemStyle: { color: c.primary, borderRadius: [2, 2, 0, 0] },
        barMaxWidth: 32
      }],
      tooltip: {
        trigger: 'axis',
        formatter: (p: any) => `${p[0].name}: €${p[0].value.toLocaleString('fr-FR')}`
      }
    }

    this.donutChartOptions = {
      series: [{
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '50%'],
        label: { show: false },
        emphasis: { scale: false },
        // TODO: wire to summary()?.statusDistribution when API is live
        data: [
          { value: 78, name: 'Payée',      itemStyle: { color: c.statusPaid } },
          { value: 18, name: 'En attente', itemStyle: { color: c.statusPending } },
          { value: 12, name: 'En retard',  itemStyle: { color: c.statusOverdue } }
        ]
      }],
      tooltip: { trigger: 'item', formatter: '{b}: {c}' }
    }

    this.dashboardService.getSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.summary.set(data); this.loading.set(false) },
        error: () => { this.error.set('Impossible de charger les données.'); this.loading.set(false) }
      })
  }
}
