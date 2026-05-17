import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  @Input() title = ''
  @Input() value = ''
  @Input() variation = 0
  @Input() variationUnit = ''
  @Input() subtitle = 'vs mois précédent'
  @Input() icon = 'pi-chart-bar'
}
