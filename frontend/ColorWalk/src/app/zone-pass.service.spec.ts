import { TestBed } from '@angular/core/testing';

import { ZonePassService } from './zone-pass.service';

describe('ZonePassService', () => {
  let service: ZonePassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZonePassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
