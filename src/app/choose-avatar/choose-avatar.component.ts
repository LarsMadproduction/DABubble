import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FeedbackOverlayComponent } from '../feedback-overlay/feedback-overlay.component';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule, FeedbackOverlayComponent, FooterComponent],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  @ViewChild(FeedbackOverlayComponent)
  feedbackOverlay!: FeedbackOverlayComponent;

  constructor(private router: Router, public userData: UserService) {}

  isArrowHovered: boolean = false;
  backArrowImage: string = '/back-arrow.png';

  avatarImages: string[] = [
    '/frederik-beck-avatar.png',
    '/elias-neumann-avatar.png',
    '/elise-roth-avatar.png',
    '/noah-braun-avatar.png',
    '/sofia-müller-avatar.png',
    '/steffen-hoffmann-avatar.png',
  ];

  selectedAvatar: string = '/default-user-avatar.png';
  createUser: boolean = true;

  /**
   * Navigates the user to the register page.
   */
  backToRegister(): void {
    this.router.navigate(['register']);
  }

  /**
   * Navigates the user back to the login page.
   * Also uploads the selected user image and updates the user data.
   */
  openLogin(): void {
    this.userData.userImage = this.selectedAvatar;
    this.userData.uploadUserData();
    this.enableButton(true);
    this.feedbackOverlay.showFeedback('Konto erfolgreich erstellt!');
    setTimeout(() => {
      this.router.navigate(['']);
    }, 1500);
  }

  /**
   * Toggles the hover state of the back arrow icon and updates its image.
   *
   * @param {boolean} hoverState - A boolean indicating whether the back arrow is being hovered.
   */
  onHoverArrow(hoverState: boolean): void {
    this.isArrowHovered = hoverState;
    this.updateArrowImage();
  }

  /**
   * Updates the back arrow icon image based on its hover state.
   * Displays the hover image if the back arrow is hovered; otherwise, displays the default image.
   */
  updateArrowImage(): void {
    if (this.isArrowHovered) {
      this.backArrowImage = '/back-arrow-hover.png';
    } else {
      this.backArrowImage = '/back-arrow.png';
    }
  }

  /**
   * Updates the selected avatar with the clicked image.
   *
   * @param {string} avatarImage - The URL of the clicked avatar image.
   */
  selectAvatar(avatarImage: string): void {
    this.selectedAvatar = avatarImage;
  }

    /**
   * Enables or disables the password submission button.
   * @param condition The condition to enable the button.
   */
    enableButton(condition: boolean): void {
      this.createUser = !condition;
    }
}
