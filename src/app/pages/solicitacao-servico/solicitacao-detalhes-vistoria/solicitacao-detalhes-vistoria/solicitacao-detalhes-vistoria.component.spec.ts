import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoDetalhesVistoriaComponent } from './solicitacao-detalhes-vistoria.component';

describe('SolicitacaoDetalhesVistoriaComponent', () => {
  let component: SolicitacaoDetalhesVistoriaComponent;
  let fixture: ComponentFixture<SolicitacaoDetalhesVistoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoDetalhesVistoriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitacaoDetalhesVistoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
