import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoServicoEditarComponent } from './solicitacao-servico-editar.component';

describe('SolicitacaoServicoEditarComponent', () => {
  let component: SolicitacaoServicoEditarComponent;
  let fixture: ComponentFixture<SolicitacaoServicoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoServicoEditarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitacaoServicoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
