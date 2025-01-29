import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileWindowComponent } from './profile-window.component';

describe('ProfileWindowComponent', () => {
  let component: ProfileWindowComponent;
  let fixture: ComponentFixture<ProfileWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
