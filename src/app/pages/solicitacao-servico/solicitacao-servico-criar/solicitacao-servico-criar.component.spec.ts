import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdemDeServicoCriarComponent } from './solicitacao-servico-criar.component';

describe('OrdemDeServicoCriarComponent', () => {
  let component: OrdemDeServicoCriarComponent;
  let fixture: ComponentFixture<OrdemDeServicoCriarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdemDeServicoCriarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdemDeServicoCriarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
