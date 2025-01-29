import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactWindowComponent } from './contact-window.component';

describe('ContactWindowComponent', () => {
  let component: ContactWindowComponent;
  let fixture: ComponentFixture<ContactWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
