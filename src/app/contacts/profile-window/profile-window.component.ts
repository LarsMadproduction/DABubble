import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-window.component.html',
  styleUrl: './profile-window.component.scss'
})
export class ProfileWindowComponent {
  userId: string = '';
  isEditMode: boolean = false;
  onlineColor: string = '#92c73e';
  offlineColor: string = '#696969';
  name: string = 'Steffen Hoffmann';  // Beispielname
  email: string = 'thehoffman@beispiel.com'; // Beispiel-E-Mail
  picture: string = '/steffen-hoffmann-avatar.png';
  status: string = '';
  selectedAvatar: string = '/default-user-avatar.png';
  @Output() onClose: EventEmitter<void> = new EventEmitter();

  constructor(public userService: UserService) { }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  ngOnInit(): void {
    this.userService.users.forEach(user => {
      if (user.id === this.userService.loggedUserId) {
        this.userId = user.id;
        this.name = user.name;
        this.email = user.email;
        this.picture = user.userImage;
        this.status = user.status
      }
    });
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    this.userService.updateUserInfo(this.userId, this.name, this.picture);
    this.close();
  }

  cancel() {
    this.toggleEditMode();
  }

  avatarImages: string[] = [
    '/frederik-beck-avatar.png',
    '/elias-neumann-avatar.png',
    '/elise-roth-avatar.png',
    '/noah-braun-avatar.png',
    '/sofia-müller-avatar.png',
    '/steffen-hoffmann-avatar.png',
  ];

    /**
   * Updates the selected avatar with the clicked image.
   *
   * @param {string} avatarImage - The URL of the clicked avatar image.
   */
    selectAvatar(avatarImage: string): void {
      this.selectedAvatar = avatarImage;
      this.picture = avatarImage; 
    }
}
