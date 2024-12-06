import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaManutencoesComponent } from './consulta-manutencoes.component';

describe('ConsultaManutencoesComponent', () => {
  let component: ConsultaManutencoesComponent;
  let fixture: ComponentFixture<ConsultaManutencoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaManutencoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultaManutencoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
