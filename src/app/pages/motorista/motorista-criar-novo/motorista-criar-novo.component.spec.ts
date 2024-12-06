import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristaCriarNovoComponent } from './motorista-criar-novo.component';

describe('MotoristaCriarNovoComponent', () => {
  let component: MotoristaCriarNovoComponent;
  let fixture: ComponentFixture<MotoristaCriarNovoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotoristaCriarNovoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MotoristaCriarNovoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
