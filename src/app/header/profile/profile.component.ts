import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ProfileWindowComponent } from "../../contacts/profile-window/profile-window.component";
import { LoginComponent } from '../../login/login.component';
import { MessageService } from '../../services/message.service';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgStyle, ProfileWindowComponent, NgClass, ProfileWindowComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @ViewChild('logoutBox') logoutBox!: ElementRef<HTMLDivElement>;
  @ViewChild('profileBox') profileBox!: ElementRef<HTMLDivElement>;
  openLogoutBox: boolean = false;
  openProfileBox: boolean = false;
  slideOut: boolean = false;

  guestUrl: string = '0LxX4SgAJLMdrMynLbem';

  constructor(public userService: UserService, private messageService: MessageService, private channelService: ChannelService) { }

  /**
   * a listener for mouseup event if the openprofilebox is active, if you click anywhere on the overlay it closes the logout box
   * 
   * @param target #openProfileBox
   */
  @HostListener('document:mouseup', ['$event.target'])
  onClickOutsideLogoutBox(target: HTMLElement): void {
    if (this.logoutBox && !this.openProfileBox) {
      let clickInsideChan = this.logoutBox.nativeElement.contains(target); {
      } if (!clickInsideChan) this.closeLogoutBox();
    }
  }

  /**
   * a listener for mouseup event if the profileBox is active, if you click anywhere on the overlay it closes the profile box
   * 
   * @param target #profileBox
   */
  @HostListener('document:click', ['$event.target'])
  onClickOutsideProfileBox(target: HTMLElement): void {
    if (this.profileBox) {
      let clickInsideChan = this.profileBox.nativeElement.contains(target); {
      } if (!clickInsideChan) this.closeProfilBox();
    }
  }

  /**
   * opens the logout Box
   */
  openLogoutUser() {
    this.openLogoutBox = true;
    this.slideOut = false;
  }

  /**
   * closes the logout box
   */
  closeLogoutBox() {
    this.openLogoutBox = false;
  }

  /**
  * opens the profile box
  */
  openProfile() {
    this.openProfileBox = true;
  }

  /**
   * closes the profile box
   */
  closeProfilBox() {
    this.openProfileBox = false;
  }

  /**
   * logs the user out and deletes all guest user comments
   * 
   * @param id the id of the guest user
   */
  logoutUser(id: string) {
    if (id === this.guestUrl) {
      this.deleteGuestComments(this.guestUrl);
    }
    this.userService.logoutUser(id)
  }

  /**
   * deletes all guest comments and channels created by the guest.
   * 
   * @param guestId the guest id
   */
  deleteGuestComments(guestId: string) {
    const filteredMessages = this.messageService.messages.filter(message =>
      (message.senderId.includes(guestId) ? 1 : 0) + (message.userId.includes(guestId) ? 1 : 0) >= 1);
    filteredMessages.forEach(async message => {
      await this.messageService.deleteMessage( message.id);
    });
    const filteredChannels = this.channelService.channels.filter(channel =>
      channel.chanCreatedByUser.includes(guestId));
    filteredChannels.forEach(async channel => {
      await this.channelService.deleteChannel(channel.chanId);
    });
  }
}
