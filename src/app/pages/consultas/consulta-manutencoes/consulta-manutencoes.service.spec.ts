import { TestBed } from '@angular/core/testing';

import { ConsultaManutencoesService } from '../consulta-manutencoes/consulta-manutencoes.service';

describe('ConsultaManutencoesService', () => {
  let service: ConsultaManutencoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultaManutencoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
