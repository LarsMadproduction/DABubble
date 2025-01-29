import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule, CommonModule, FooterComponent, RouterLink],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  constructor(private router: Router, public userData: UserService) { }

  emailImg: string = '/mail-grey.png';
  lockImg: string = '/lock-grey.png';
  userNameImg: string = '/user-name-icon-grey.png';
  confirmLockImg: string = '/lock-grey.png';

  emailText: string = '';
  passwordText: string = '';
  confirmPasswordText: string = '';
  userNameText: string = '';

  isChecked: boolean = false;
  isHovered: boolean = false;
  showError: boolean = false;
  emailError: boolean = false;
  passwordError: boolean = false;
  confirmPasswordError: boolean = false;
  userNameError: boolean = false;
  currentImage: string = '/check-field.png';

  isArrowHovered: boolean = false;
  backArrowImage: string = '/back-arrow.png';

  visibilityIcon: string = './visibility_off.png';
  passwordFieldType: string = 'password';
  confirmPasswordFieldType: string = 'password';
  confirmVisibilityIcon: string = './visibility_off.png';

  next: boolean = false;
  regexpName = /^[A-Za-zÄÖÜäöüß]{3,}([ ]?[A-Za-zÄÖÜäöüß]{2,})*$/;
  regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  /**
   * Creates a new user by setting the properties in the `userData` service.
   */
  createUser() {
    this.userData.userName = this.userNameText;
    this.userData.email = this.emailText;
    this.userData.password = this.passwordText;
    this.userData.confirmPassword = this.confirmPasswordText;
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
   * Navigates the user back to the login page.
   */
  backToLogin(): void {
    this.router.navigate(['']);
  }

  /**
   * Handles navigation to the avatar selection page.
   * Displays error messages if fields are invalid or passwords do not match.
   */
  openAvatar(): void {
    let allFieldsFilled =
      this.emailText &&
      this.passwordText &&
      this.confirmPasswordText &&
      this.userNameText;
    let passwordsMatch = this.passwordText === this.confirmPasswordText;
    let isPasswordStrong = this.passwordRegex.test(this.passwordText);

    if (
      !allFieldsFilled ||
      !passwordsMatch ||
      !isPasswordStrong ||
      !this.isChecked
    ) {
      this.showError = true;
    } else {
      this.showError = false;
      this.router.navigate(['avatar']);
      this.createUser();
    }
  }

  /**
   * Enables or disables the email submission button.
   * @param {boolean} isValid - Whether the email is valid.
   */
  enableButton(isValid: boolean | null | undefined): void {
    this.next =
      !!isValid &&
      this.userNameText.length >= 3 &&
      this.passwordText === this.confirmPasswordText;
  }

  /**
   * Checks if the form is valid based on password length and match.
   * @returns True if the passwords are valid and match.
   */
  private isFormValid(): boolean {
    return this.regexp.test(this.emailText);
  }

  /**
   * Updates the icon color of an input field when it gains focus.
   * @param {string} field - The input field name ('email', 'password', 'confirm', or 'userName').
   */
  onFocus(field: string): void {
    if (field === 'email' && !this.emailText) {
      this.emailImg = '/mail-black.png';
    } else if (field === 'password' && !this.passwordText) {
      this.lockImg = '/lock-black.png';
    } else if (field === 'confirm' && !this.confirmPasswordText) {
      this.confirmLockImg = '/lock-black.png';
    } else if (field === 'userName' && !this.userNameText) {
      this.userNameImg = '/user-name-icon-black.png';
    }
  }

  /**
   * Updates the icon color of an input field when it loses focus.
   * Resets the icon to gray if the field is empty.
   * @param {string} field - The input field name ('email', 'password', 'confirm', or 'userName').
   */
  onBlur(field: string): void {
    if (field === 'email' && !this.emailText) {
      this.emailImg = '/mail-grey.png';
    } else if (field === 'password' && !this.passwordText) {
      this.lockImg = '/lock-grey.png';
    } else if (field === 'confirm' && !this.confirmPasswordText) {
      this.confirmLockImg = '/lock-grey.png';
    } else if (field === 'userName' && !this.userNameText) {
      this.userNameImg = '/user-name-icon-grey.png';
    }
  }

  /**
   * Updates the text and icon of an input field as the user types.
   * Includes password strength validation.
   * @param {string} field - The input field name ('email', 'password', 'confirm', or 'userName').
   * @param {Event} event - The input event containing the user's input.
   */
  onInput(field: string, event: Event): void {
    let value = (event.target as HTMLInputElement).value;
  
    if (field === 'email') {
      this.emailText = value;
      this.emailImg = value ? '/mail-black.png' : '/mail-grey.png';
      this.emailError = !this.regexp.test(value);
    } else if (field === 'password') {
      this.passwordText = value;
      this.lockImg = value ? '/lock-black.png' : '/lock-grey.png';
      this.passwordError = !this.passwordRegex.test(value);
    } else if (field === 'confirm') {
      this.confirmPasswordText = value;
      this.confirmLockImg = value ? '/lock-black.png' : '/lock-grey.png';
      this.confirmPasswordError = this.passwordText !== this.confirmPasswordText;
    } else if (field === 'userName') {
      this.userNameText = value;
      this.userNameImg = value
        ? '/user-name-icon-black.png'
        : '/user-name-icon-grey.png';
      this.userNameError = !this.regexpName.test(value) || value.trim().length < 3;
    }
  
    this.enableButton(this.isFormValid());
  }

  /**
   * Toggles the hover state of the checkbox and updates the checkbox image.
   * @param {boolean} hoverState - Whether the checkbox is hovered.
   */
  onHover(hoverState: boolean): void {
    this.isHovered = hoverState;
    this.updateImage();
  }

  /**
   * Toggles the checked state of the checkbox and updates the checkbox image.
   */
  onClick(): void {
    this.isChecked = !this.isChecked;
    this.updateImage();
  }

  /**
   * Updates the checkbox image based on its checked and hover states.
   */
  updateImage(): void {
    if (this.isChecked && this.isHovered) {
      this.currentImage = '/check-field-checkmarked-hover.png';
    } else if (this.isChecked) {
      this.currentImage = '/check-field-checkmarked.png';
    } else if (this.isHovered) {
      this.currentImage = '/check-field-hover.png';
    } else {
      this.currentImage = '/check-field.png';
    }
  }

  /**
   * Toggles the hover state of the back arrow icon and updates its image.
   * @param {boolean} hoverState - Whether the back arrow is hovered.
   */
  onHoverArrow(hoverState: boolean): void {
    this.isArrowHovered = hoverState;
    this.updateArrowImage();
  }

  /**
   * Updates the back arrow icon image based on its hover state.
   */
  updateArrowImage(): void {
    if (this.isArrowHovered) {
      this.backArrowImage = '/back-arrow-hover.png';
    } else {
      this.backArrowImage = '/back-arrow.png';
    }
  }
}
