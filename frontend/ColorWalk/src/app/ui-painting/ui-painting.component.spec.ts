import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiPaintingComponent } from './ui-painting.component';

describe('UiPaintingComponent', () => {
  let component: UiPaintingComponent;
  let fixture: ComponentFixture<UiPaintingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPaintingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiPaintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
