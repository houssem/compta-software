import { Component, Input, OnChanges } from '@angular/core'
import { NgxEchartsModule } from 'ngx-echarts'
import type { EChartsOption } from 'echarts'

@Component({
  selector: 'app-comparison-bar',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './comparison-bar.component.html'
})
export class ComparisonBarComponent implements OnChanges {
  @Input() series: { month: string; invoiced: number; collected: number }[] = []

  chartOptions: EChartsOption = {}

  ngOnChanges(): void {
    this.chartOptions = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Facturé', 'Encaissé'], bottom: 0 },
      xAxis: { type: 'category', data: this.series.map(s => s.month) },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}k €` } },
      series: [
        {
          name: 'Facturé',
          type: 'bar',
          stack: 'total',
          data: this.series.map(s => s.invoiced)
        },
        {
          name: 'Encaissé',
          type: 'bar',
          stack: 'total',
          data: this.series.map(s => s.collected)
        }
      ],
      grid: { left: '10%', right: '4%', bottom: '15%', top: '8%' }
    }
  }
}
