import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card styleClass="h-full">
      <div class="flex align-items-start justify-content-between">
        <div class="flex flex-column gap-2">
          <span class="text-color-secondary text-sm font-medium uppercase">{{ title }}</span>
          <span class="text-3xl font-bold text-color">{{ value }}</span>
          <div class="flex align-items-center gap-1 text-sm">
            <i class="pi"
               [class.pi-arrow-up]="variation >= 0"
               [class.pi-arrow-down]="variation < 0"
               [class.text-green-500]="variation >= 0"
               [class.text-red-500]="variation < 0"></i>
            <span [class.text-green-500]="variation >= 0" [class.text-red-500]="variation < 0">
              {{ variation >= 0 ? '+' : '' }}{{ variation }}{{ variationUnit }}
            </span>
            <span class="text-color-secondary">{{ subtitle }}</span>
          </div>
        </div>
        <div class="flex align-items-center justify-content-center border-round surface-100"
             style="width: 48px; height: 48px; flex-shrink: 0">
          <i class="pi text-2xl text-primary" [class]="icon"></i>
        </div>
      </div>
    </p-card>
  `
})
export class KpiCardComponent {
  @Input() title = ''
  @Input() value = ''
  @Input() variation = 0
  @Input() variationUnit = ''
  @Input() subtitle = 'vs mois précédent'
  @Input() icon = 'pi-chart-bar'
}
