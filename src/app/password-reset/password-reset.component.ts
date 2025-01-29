import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  Firestore,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  collection,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import { FeedbackOverlayComponent } from '../feedback-overlay/feedback-overlay.component';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [FormsModule, CommonModule, FeedbackOverlayComponent, FooterComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent implements OnInit {
  @ViewChild(FeedbackOverlayComponent)
  feedbackOverlay!: FeedbackOverlayComponent;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  token: string | null = null;
  lockImg: string = '/lock-grey.png';
  confirmLockImg: string = '/lock-grey.png';
  passwordText: string = '';
  confirmPasswordText: string = '';
  isPasswordValid: boolean = true;
  showError: boolean = false;

  visibilityIcon: string = './visibility_off.png';
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  confirmVisibilityIcon: string = './visibility_off.png';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => this.setToken(params));
  }
  /**
   * Handles the mouse down event for the primary password input field.
   * Changes the field type to 'text' to display the password and updates the visibility icon.
   */
  onPasswordMouseDown(): void {
    this.passwordFieldType = 'text';
    this.visibilityIcon = './visibility.png';
  }

  /**
   * Handles the mouse up event for the primary password input field.
   * Changes the field type back to 'password' to hide the password and resets the visibility icon.
   */
  onPasswordMouseUp(): void {
    this.passwordFieldType = 'password';
    this.visibilityIcon = './visibility_off.png';
  }

  /**
   * Handles the mouse down event for the confirmation password input field.
   * Changes the field type to 'text' to display the password and updates the visibility icon.
   */
  onConfirmMouseDown(): void {
    this.confirmPasswordFieldType = 'text';
    this.confirmVisibilityIcon = './visibility.png';
  }

  /**
   * Handles the mouse up event for the confirmation password input field.
   * Changes the field type back to 'password' to hide the password and resets the visibility icon.
   */
  onConfirmMouseUp(): void {
    this.confirmPasswordFieldType = 'password';
    this.confirmVisibilityIcon = './visibility_off.png';
  }

  /**
   * Sets the token from route parameters.
   * @param params The route parameters.
   */
  private setToken(params: ParamMap): void {
    this.token = params.get('token');
  }

  /**
   * Updates the icon color of an input field when it gains focus.
   * @param field The name of the field (password or confirm).
   */
  onFocus(field: string): void {
    if (this.isPasswordField(field)) {
      this.lockImg = '/lock-black.png';
    } else if (this.isConfirmField(field)) {
      this.confirmLockImg = '/lock-black.png';
    }
  }

  /**
   * Checks if the field is password.
   * @param field The name of the field.
   * @returns True if the field is password.
   */
  private isPasswordField(field: string): boolean {
    return field === 'password' && !this.passwordText;
  }

  /**
   * Checks if the field is confirm password.
   * @param field The name of the field.
   * @returns True if the field is confirm password.
   */
  private isConfirmField(field: string): boolean {
    return field === 'confirm' && !this.confirmPasswordText;
  }

  /**
   * Updates the icon color of an input field when it loses focus.
   * @param field The name of the field (password or confirm).
   */
  onBlur(field: string): void {
    if (this.isPasswordField(field)) {
      this.lockImg = '/lock-grey.png';
    } else if (this.isConfirmField(field)) {
      this.confirmLockImg = '/lock-grey.png';
    }
  }

  /**
   * Updates the text and icon of an input field as the user types.
   * @param field The name of the field (password or confirm).
   * @param event The input event.
   */
  onInput(field: string, event: Event): void {
    let value = (event.target as HTMLInputElement).value;
    this.updatePasswordField(field, value);
    this.enableButton(this.isFormValid());
  }

  /**
   * Updates the password or confirm field and icon based on input.
   * @param field The name of the field.
   * @param value The current input value.
   */
  private updatePasswordField(field: string, value: string): void {
    if (field === 'password') {
      this.passwordText = value;
      this.lockImg = value ? '/lock-black.png' : '/lock-grey.png';
    } else if (field === 'confirm') {
      this.confirmPasswordText = value;
      this.confirmLockImg = value ? '/lock-black.png' : '/lock-grey.png';
    }
  }

  /**
   * Checks if the form is valid based on password length and match.
   * @returns True if the passwords are valid and match.
   */
  private isFormValid(): boolean {
    return (
      this.passwordText.length >= 8 &&
      this.passwordText === this.confirmPasswordText
    );
  }

  /**
   * Enables or disables the password submission button.
   * @param condition The condition to enable the button.
   */
  enableButton(condition: boolean): void {
    this.isPasswordValid = !condition;
  }

  /**
   * Updates the user's password in Firestore if the token is valid.
   */
  async updatePw(): Promise<void> {
    if (!this.token) return;
    try {
      await this.processPasswordUpdate();
      this.enableButton(false);
      this.showError = false;
      this.passwordText = '';
      this.confirmPasswordText = '';
    } catch (error) {
      console.error('Error updating password:', error);
    }
  }

  /**
   * Processes the password update in Firestore.
   */
  private async processPasswordUpdate(): Promise<void> {
    let usersRef = collection(this.firestore, 'user');
    let tokenQuery = query(usersRef, where('token', '==', this.token));
    let querySnapshot = await getDocs(tokenQuery);

    if (querySnapshot.empty) return;

    querySnapshot.forEach(async (docSnap) => {
      await this.updateUserPassword(docSnap);
    });
  }

  /**
   * Updates the user's password in Firestore and navigates to home.
   * @param docSnap The document snapshot of the user.
   */
  private async updateUserPassword(
    docSnap: QueryDocumentSnapshot
  ): Promise<void> {
    let userDocRef = doc(this.firestore, 'user', docSnap.id);
    await updateDoc(userDocRef, {
      password: this.passwordText,
      token: null,
    });
    this.feedbackOverlay.showFeedback('Passwort neu vergeben!');
    setTimeout(() => {
      this.router.navigate(['']);
    }, 1500);
  }
}
