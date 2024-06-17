import { TestBed } from '@angular/core/testing';

import { PaintingNearService } from './painting-near.service';

describe('PaintingNearService', () => {
  let service: PaintingNearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaintingNearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
