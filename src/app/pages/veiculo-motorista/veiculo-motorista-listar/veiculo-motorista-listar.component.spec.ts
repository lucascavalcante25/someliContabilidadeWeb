import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoMotoristaListarComponent } from './veiculo-motorista-listar.component';

describe('VeiculoMotoristaListarComponent', () => {
  let component: VeiculoMotoristaListarComponent;
  let fixture: ComponentFixture<VeiculoMotoristaListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoMotoristaListarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VeiculoMotoristaListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
