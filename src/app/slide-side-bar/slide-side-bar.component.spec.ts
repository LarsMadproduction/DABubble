import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideSideBarComponent } from './slide-side-bar.component';

describe('SlideSideBarComponent', () => {
  let component: SlideSideBarComponent;
  let fixture: ComponentFixture<SlideSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
