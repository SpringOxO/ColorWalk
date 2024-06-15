import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteWorldComponent } from './white-world.component';

describe('WhiteWorldComponent', () => {
  let component: WhiteWorldComponent;
  let fixture: ComponentFixture<WhiteWorldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhiteWorldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhiteWorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
