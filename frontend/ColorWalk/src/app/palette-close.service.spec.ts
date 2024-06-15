import { TestBed } from '@angular/core/testing';

import { PaletteCloseService } from './palette-close.service';

describe('PaletteCloseService', () => {
  let service: PaletteCloseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaletteCloseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
