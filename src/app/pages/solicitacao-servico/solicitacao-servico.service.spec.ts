import { TestBed } from '@angular/core/testing';

import { OrdemDeServicoService } from './solicitacao-servico.service';

describe('OrdemDeServicoService', () => {
  let service: OrdemDeServicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdemDeServicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
