import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristaListarComponent } from './motorista-listar.component';

describe('MotoristaListarComponent', () => {
  let component: MotoristaListarComponent;
  let fixture: ComponentFixture<MotoristaListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotoristaListarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MotoristaListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
