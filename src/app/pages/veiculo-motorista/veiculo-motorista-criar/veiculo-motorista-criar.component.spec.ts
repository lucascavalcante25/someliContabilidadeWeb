import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoMotoristaCriarComponent } from './veiculo-motorista-criar.component';

describe('VeiculoMotoristaCriarComponent', () => {
  let component: VeiculoMotoristaCriarComponent;
  let fixture: ComponentFixture<VeiculoMotoristaCriarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoMotoristaCriarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VeiculoMotoristaCriarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
