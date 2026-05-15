import { Component, Input, OnChanges } from '@angular/core'
import { NgxEchartsModule } from 'ngx-echarts'
import type { EChartsOption } from 'echarts'

@Component({
  selector: 'app-status-donut',
  standalone: true,
  imports: [NgxEchartsModule],
  template: `
    <div echarts [options]="chartOptions" style="height: 280px; width: 100%"></div>
  `
})
export class StatusDonutComponent implements OnChanges {
  @Input() distribution: { status: string; count: number }[] = []

  chartOptions: EChartsOption = {}

  ngOnChanges(): void {
    this.chartOptions = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: '5%', top: 'center' },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        data: this.distribution.map(d => ({ name: d.status, value: d.count })),
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } }
      }]
    }
  }
}
