import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdemDeServicoListarComponent } from './solicitacao-servico-listar.component';

describe('OrdemDeServicoListarComponent', () => {
  let component: OrdemDeServicoListarComponent;
  let fixture: ComponentFixture<OrdemDeServicoListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdemDeServicoListarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdemDeServicoListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
