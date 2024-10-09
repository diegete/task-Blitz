import { TestBed } from '@angular/core/testing';

import { CreateTasksService } from './create-tasks.service';

describe('CreateTasksService', () => {
  let service: CreateTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
