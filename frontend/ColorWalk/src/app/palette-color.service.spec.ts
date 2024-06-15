import { TestBed } from '@angular/core/testing';

import { PaletteColorService } from './palette-color.service';

describe('PaletteColorService', () => {
  let service: PaletteColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaletteColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
