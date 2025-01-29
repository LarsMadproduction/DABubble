import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetSendMailComponent } from './password-reset-send-mail.component';

describe('PasswordResetSendMailComponent', () => {
  let component: PasswordResetSendMailComponent;
  let fixture: ComponentFixture<PasswordResetSendMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetSendMailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordResetSendMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
