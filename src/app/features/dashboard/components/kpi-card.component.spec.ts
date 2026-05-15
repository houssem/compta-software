import { TestBed, ComponentFixture } from '@angular/core/testing'
import { KpiCardComponent } from './kpi-card.component'

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<KpiCardComponent>
  let component: KpiCardComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent]
    }).compileComponents()
    fixture = TestBed.createComponent(KpiCardComponent)
    component = fixture.componentInstance
    component.title = 'Factures émises'
    component.value = '47'
    component.variation = 12
    component.icon = 'pi-file'
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('renders the title', () => {
    const el: HTMLElement = fixture.nativeElement
    expect(el.textContent).toContain('Factures émises')
  })

  it('renders the value', () => {
    const el: HTMLElement = fixture.nativeElement
    expect(el.textContent).toContain('47')
  })

  it('shows positive variation with up arrow', () => {
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.pi-arrow-up')).toBeTruthy()
  })

  it('shows negative variation with down arrow', () => {
    component.variation = -5
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.pi-arrow-down')).toBeTruthy()
  })
})
