import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxEchartsModule } from 'ngx-echarts'
import type { EChartsOption } from 'echarts'
import { DashboardService } from '../dashboard/dashboard.service'
import { DashboardSummary } from '../../shared/models/kpi.model'

@Component({
  selector: 'app-dashboard-vente',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './dashboard-vente.component.html',
  styleUrls: ['./dashboard-vente.component.scss']
})
export class DashboardVenteComponent implements OnInit {
  summary = signal<DashboardSummary | null>(null)
  loading = signal(true)
  error = signal('')

  revenueChartOptions: EChartsOption = {
    grid: { top: 8, right: 8, bottom: 0, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'],
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, fontWeight: 600, color: '#43474f', fontFamily: 'Inter' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { fontSize: 11, color: '#43474f', fontFamily: 'Inter',
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k` }
    },
    series: [{
      type: 'bar',
      data: [3200, 4100, 3800, 3100, 4800, 4200, 3900, 5100, 4400, 4700, 5200, 4900],
      itemStyle: { color: '#001e40', borderRadius: [2, 2, 0, 0] },
      barMaxWidth: 32
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (p: any) => `${p[0].name}: €${p[0].value.toLocaleString('fr-FR')}`
    }
  }

  donutChartOptions: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['52%', '76%'],
      center: ['50%', '50%'],
      label: { show: false },
      emphasis: { scale: false },
      data: [
        { value: 78, name: 'Payée', itemStyle: { color: '#10B981' } },
        { value: 18, name: 'En attente', itemStyle: { color: '#F59E0B' } },
        { value: 12, name: 'En retard', itemStyle: { color: '#EF4444' } }
      ]
    }],
    tooltip: { trigger: 'item', formatter: '{b}: {c}' }
  }

  recentInvoices = [
    { number: 'INV-2023-089', client: 'Acme Corp Dynamics',  date: '24 oct. 2023', amount: '1 250,00 €', status: 'paid',    label: 'Payée' },
    { number: 'INV-2023-090', client: 'Global Logistics Ltd', date: '26 oct. 2023', amount: '840,00 €',   status: 'overdue', label: 'En retard' },
    { number: 'INV-2023-091', client: 'Horizon Ventures',     date: '27 oct. 2023', amount: '3 100,00 €', status: 'pending', label: 'En attente' }
  ]

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => { this.summary.set(data); this.loading.set(false) },
      error: () => { this.error.set('Impossible de charger les données.'); this.loading.set(false) }
    })
  }
}
