import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipamentoCriarNovoComponent } from './equipamento-criar-novo.component';

describe('EquipamentoCriarNovoComponent', () => {
  let component: EquipamentoCriarNovoComponent;
  let fixture: ComponentFixture<EquipamentoCriarNovoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipamentoCriarNovoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquipamentoCriarNovoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
