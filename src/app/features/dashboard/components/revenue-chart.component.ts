import { Component, Input, OnChanges } from '@angular/core'
import { NgxEchartsModule } from 'ngx-echarts'
import type { EChartsOption } from 'echarts'

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './revenue-chart.component.html'
})
export class RevenueChartComponent implements OnChanges {
  @Input() series: { month: string; amount: number }[] = []

  chartOptions: EChartsOption = {}

  ngOnChanges(): void {
    this.chartOptions = {
      tooltip: { trigger: 'axis', formatter: (params: any) => `${params[0].name}<br/>CA : ${params[0].value.toLocaleString('fr-FR')} €` },
      xAxis: { type: 'category', data: this.series.map(s => s.month), axisLabel: { rotate: 30, fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k €` } },
      series: [{
        type: 'line',
        data: this.series.map(s => s.amount),
        smooth: true,
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 }
      }],
      grid: { left: '10%', right: '4%', bottom: '15%', top: '8%' }
    }
  }
}
