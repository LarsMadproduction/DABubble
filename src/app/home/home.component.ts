
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoxComponent } from "../chat-box/chat-box.component";
import { SlideSideBarComponent } from '../slide-side-bar/slide-side-bar.component';
import { ChannelService } from '../services/channel.service';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChatBoxComponent, SlideSideBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  channelService = inject(ChannelService);
  messageService = inject(MessageService);
  userService = inject(UserService);
  slideOutNavBar: boolean = false;
  newMessage: boolean = false;
  chatType: 'private' | 'channel' | 'thread' | 'new' = 'new';  


  determineChatType(): 'private' | 'channel' | 'thread' | 'new' {
    if (this.newMessage) {
      return 'new';
    } else if (this.channelService.channelChatId) {
      return 'channel';
    } else if (this.userService.privMsgUserId) {
      return 'private';
    }
    return 'new'; // Default case if no condition is met
  }

}



