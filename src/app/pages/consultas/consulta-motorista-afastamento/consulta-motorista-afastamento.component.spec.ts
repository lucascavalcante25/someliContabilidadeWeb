import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaMotoristaAfastamentoComponent } from './consulta-motorista-afastamento.component';

describe('ConsultaMotoristaAfastamentoComponent', () => {
  let component: ConsultaMotoristaAfastamentoComponent;
  let fixture: ComponentFixture<ConsultaMotoristaAfastamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaMotoristaAfastamentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultaMotoristaAfastamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
