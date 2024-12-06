import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipamentoListarComponent } from './equipamento-listar.component';

describe('MotoristaListarComponent', () => {
  let component: EquipamentoListarComponent;
  let fixture: ComponentFixture<EquipamentoListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipamentoListarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquipamentoListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
