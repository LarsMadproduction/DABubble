import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ChatBoxComponent } from '../../chat-box/chat-box.component';
import { ChannelService } from '../../services/channel.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-contact-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-window.component.html',
  styleUrl: './contact-window.component.scss'
})
export class ContactWindowComponent {
  onlineColor: string = '#92c73e';
  offlineColor: string = '#696969';
  name: string = 'Steffen Hoffmann';
  email: string = 'thehoffman@beispiel.com';
  userId: string = '';
  picture: string = '/steffen-hoffmann-avatar.png';
  isActive: boolean = false;
  @Output() onClose: EventEmitter<void> = new EventEmitter();

  constructor(public userService: UserService,
     private chatBox: ChatBoxComponent,
      private channelService: ChannelService,
      private messageService: MessageService) { }

  ngOnInit(): void {
    this.userService.users.forEach(user => {
      if (user.id === this.userService.profileUserId) {
        this.name = user.name;
        this.email = user.email;
        this.picture = user.userImage;
        this.userId = user.id;
        this.isActive = user.status == "online";
      }
    });
  }

  close(): void {
    this.onClose.emit();
  }

  // Diese Methode könnte verwendet werden, um den Status von einer Datenbank abzurufen
  fetchStatusFromDatabase() {
  }

  openDirectMessage(id: string) {
    this.channelService.channelChatId = '';
    this.userService.privMsgUserId = id;
    this.chatBox.closeDisplayUsersBox();
    this.messageService.focusMessageInput();
    this.close();
  }
}
