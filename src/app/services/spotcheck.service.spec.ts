import { TestBed } from '@angular/core/testing';

import { SpotcheckService } from './spotcheck.service';

describe('SpotcheckService', () => {
  let service: SpotcheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotcheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
