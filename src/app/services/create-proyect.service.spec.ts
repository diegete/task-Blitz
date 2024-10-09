import { TestBed } from '@angular/core/testing';

import { CreateProyectService } from './create-proyect.service';

describe('CreateProyectService', () => {
  let service: CreateProyectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateProyectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
