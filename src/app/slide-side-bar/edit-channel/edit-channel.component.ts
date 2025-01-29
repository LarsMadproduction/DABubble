import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { Channel } from '../../interfaces/channel.model';
import { MessageService } from '../../services/message.service';


@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  @ViewChild('createdChannelBox') editBox!: ElementRef<HTMLDivElement>;
  inputPlaceholder = 'Name eingeben';
  onlineColor = '#92c73e';
  offlineColor = '#696969';
  @Input({required: true}) channelId!: string;
  @Output() onClose: EventEmitter<void> = new EventEmitter();
  channel!: Channel;
  channelCreatorName: string = '';

  constructor(private userService: UserService ,private channelService: ChannelService, private messageService: MessageService) {
 
  }

  ngOnInit(): void {
    this.channelService.channels.forEach(element => {
      if (element.chanId === this.channelId) {
        this.channel = {
          ...element
        }
      }
    });
    this.channelCreatorName = this.userService.getUserById(this.channel.chanCreatedByUser).name;
  }

  /**
   * closes the module Create Channel
   */
  closeEditChannel() {
    this.onClose.emit();
  }

  /**
   * updates the channel
   */
  updateChannel() {
    this.channelService.updateChannel(this.channel);
  }

  /**
   * removes the user from the channel
   */
  removeUser() {
    let index = this.channel.userIds.indexOf(this.userService.loggedUserId);
    console.log(this.userService.loggedUserId)
    console.log(this.channel.userIds.splice(index, 1));
    this.updateChannel();
    this.closeEditChannel();
    this.openNewMsgChannel(); 
  }

  /**
   * opens a new chatbox with an empty msg
   */
  openNewMsgChannel() {
    this.channelService.isServer = false;
    this.channelService.channelChatId = '';
    this.userService.privMsgUserId = '';
    this.messageService.threadOpen = false;
    this.channelService.isServer = false;
  }

  /**
   * a listener for mouseup event if the profileBox is active, if you click anywhere on the overlay it closes the profile box
   * 
   * @param target #profileBox
   */
  @HostListener('document:click', ['$event.target'])
  onClickOutsideProfileBox(target: HTMLElement): void {
      let clickInsideChan = this.editBox.nativeElement.contains(target);
      if (!clickInsideChan) { this.closeEditChannel(); }
  }
}
