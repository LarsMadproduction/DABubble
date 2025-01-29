
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  inputPlaceholder = 'Name eingeben';
  onlineColor = '#92c73e';
  offlineColor = '#696969';
  @ViewChild('createdChannelBox') createdChannelBox!: ElementRef<HTMLDivElement>;
  @ViewChild('createPeopleBox') createPeopleBox!: ElementRef<HTMLDivElement>;
  @ViewChild('focusdropdown') focusDropdown!: ElementRef;

  addingUsers: boolean = false;
  dropdownActive: boolean = false;

  channelName: string = '';
  channelDescription: string = '';
  selectedUserId: string[] = [];
  selectedOption: string | null = null;

  searchInput: string = '';
  searchUser: string = '';
  searchIds: string[] = [];

  constructor(public userService: UserService, private channelService: ChannelService) {
    this.searchIds = this.userService.users.map(user => user.id);
  }

  /**
   * closes the Module if the user clicks outside the input box
   * 
   * @param target The Box with the inputs for the channela
   */
  @HostListener('document:mouseup', ['$event.target'])
  onClickOutsideChan(target: HTMLElement): void {
    if (this.createdChannelBox || this.createPeopleBox) {
      let clickInsideChan = this.createdChannelBox.nativeElement.contains(target);
      let clickInsidePpl = this.createPeopleBox.nativeElement.contains(target);
      if (!clickInsideChan && !clickInsidePpl) this.closeCreateChan();
    }
  }

  /**
   * closes the Module if the user clicks outside the create people box
   * 
   * @param target The Box with the inputs for the channela
   */
  @HostListener('document:mousedown', ['$event.target'])
  onClickOutsideDrop(target: HTMLElement): void {
    if (this.createPeopleBox) {
      let clickInsideDrop = this.focusDropdown?.nativeElement.contains(target); {
      } if (!clickInsideDrop) this.dropdownActive = false;;
    }
  }

  /**
   * adds the User to the channel that is created
   * 
   * @param id the user id that is to be added
   */
  selectUser(id: string) {
    this.inputPlaceholder = '';
    if (this.isSelected(id)) {
      this.selectedUserId.forEach((element, index) => {
        if (element === id) {
          this.selectedUserId.splice(index, 1);
          this.checkInputEmpty();
        }
      });
    } else this.selectedUserId.push(id);
  }

  /**
   * checks if no user is selected and changes the placeholder of the input
   */
  checkInputEmpty() {
    if (this.selectedUserId.length === 0) {
      this.inputPlaceholder = 'Name eingeben';
    }
  }

  /**
   * checks if the user is already selected
   * 
   * @param id user id
   * @returns true if User is already selected
   */
  isSelected(id: string): boolean {
    return this.selectedUserId.includes(id);
  }

  /**
   * checks the inputfield and updates the dropwdownmenu for the result
   */
  updateField() {
    const input = this.searchInput.toLowerCase();
    if (input.length >= 3) {
      this.searchIds = this.userService.users
        .filter(user => user.name.toLowerCase().includes(input))
        .map(user => user.id);
    } else this.searchIds = this.userService.users.map(user => user.id);
  }

  /**
   * closes the module Create Channel
   */
  closeCreateChan() {
    this.channelService.createChannelBox = false;
  }

  /**
   * closes the AddUser Box
   */
  closeAddUsers() {
    this.addingUsers = false;
  }

  /**
   * Creates a new Channel based on the inputs given by the user and closes the create channel box
   * 
   * @returns none if no user is selected
   */
  createChanel() {
    if (this.selectedUserId.length === 0 && this.selectedOption !== 'all') return;
    if (this.selectedOption === 'all') this.selectedUserId = this.userService.users.map(user => user.id);
    if (!this.selectedUserId.includes(this.userService.loggedUserId)) {
      this.selectedUserId.push(this.userService.loggedUserId);
    }
    this.channelService.userIds = this.selectedUserId;
    this.channelService.chanCreatedByUser = this.userService.loggedUserId;
    const channel = this.channelService.getCurChanObj();
    this.channelService.createChannel(channel);
    this.closeCreateChan();
  }

  /**
   * checks if the channelname the user wants to create already exists and adds a number to it if it has the same name
   */
  checkChanName() {
    if (this.channelName.length > 2) {
      let baseName = this.channelName;
      let newName = baseName;
      let counter = 1;
      while (this.channelService.channels.some(channel => channel.chanName === newName)) {
        newName = `${counter} ${baseName}`;
        counter++;
      }
      this.channelService.chanName = newName;
      this.channelService.chanDescription = this.channelDescription;
      this.addingUsers = true;
    }
  }
}
