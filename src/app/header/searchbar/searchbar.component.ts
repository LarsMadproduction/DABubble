import { Component, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';


@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss'
})
export class SearchbarComponent {
  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' | '' = '';
  @ViewChild('searchbarDropdown') searchbarDropdown!: ElementRef<HTMLDivElement>;
  dropdownActive: boolean = false;
  searchBar: string = '';
  filteredEmails: string[] = [];
  filteredUsers: string[] = [];
  filteredChannels: string[] = [];
  filteredMessagesWithChannels: { messageId: string; chanName: string; channelId: string; messageText: string; }[] = [];
  filteredMessagesWithThreads: { messageId: string; messageThreadId: string; messageText: string; }[] = [];
  filteredMessagesWithPrivChat: { messageId: string; messageUserId: string; messageSenderId: string; messageText: string; }[] = [];

  constructor(public channelService: ChannelService, public userService: UserService, public messageService: MessageService) { }

  /**
   * a listener for mouseup event if the searchbarDropdown is active, if you click anywhere on the overlay it closes the logout box
   * 
   * @param target #searchbarDropdown
   */
  @HostListener('document:mouseup', ['$event.target'])
  onClickOutsideChan(target: HTMLElement): void {
    if (this.searchbarDropdown) {
      let clickInsideChan = this.searchbarDropdown.nativeElement.contains(target); {
      } if (!clickInsideChan) this.closesearchbarDropdown();
    }
  }

  /**
   * closes the searchbar dropdown and clears the search bar
   */
  closesearchbarDropdown() {
    this.dropdownActive = false;
    this.searchBar = '';
    this.checkNoFindings();
  }

  /**
   * filters all the search result for the input
   * 
   * @param userInput the input the user types in the searchbar
   */
  searchResults(userInput: string) {
    this.dropdownActive = true;
    const input = userInput.toLowerCase();
    if (input.length >= 3) {
      const id = this.userService.loggedUserId;
      this.filterUsers(input);
      this.filterChannels(input, id);
      this.filterMessagesInChannels(input, id);
      this.filterMessagesInPrivate(input, id);
      this.filterMessagesinThreads(input, id);
    } else this.checkNoFindings();
  }

  searchInNewChat(userInput: string) {
    if (userInput.length === 0) {
      this.checkNoFindings();
      this.dropdownActive = false
    } else {
      const input = userInput.toLowerCase();
      this.dropdownActive = true;
      if (input.startsWith('@')) {
        this.filterUsers(input.substring(1));
      }
      else if (input.startsWith('#')) {
        const id = this.userService.loggedUserId;
        this.filterChannels(input.substring(1), id);
      }
      else {
        this.filterUserEmail(input);
      }
    }
  }


  /**
   * filters all users and check if the input matches one of them or includes the input
   * 
   * @param input the input the user types in the searchbar
   */
  filterUsers(input: string) {
    this.filteredUsers = this.userService.users
      .filter(users => users.name.toLowerCase().includes(input))
      .map(user => user.id);
  }


  /**
   * filters all users and check if the input matches one of the emails
   * 
   * @param input the input the user types in the searchbar
   */
  filterUserEmail(input: string) {
    this.filteredEmails = this.userService.users
      .filter(users => users.email.toLowerCase().includes(input))
      .map(user => user.id);
  }

  /**
   * filters all channels and check if the input matches one of them or includes the input,
   * then checks if the input matches the users that are included on the channel
   * only return if the logged in user is also in the channel
   * 
   * @param input the input the user types in the searchbar
   * @param loggedUserId currently logged in user
   */
  filterChannels(input: string, loggedUserId: string) {
    this.filteredChannels = this.channelService.channels
      .filter(channel => {
        const matchesChannelName = channel.chanName.toLowerCase().includes(input);
        const hasMatchingUser = this.filteredUsers.some(userId => channel.userIds.includes(userId && loggedUserId));
        const hasLoggedUser = channel.userIds.includes(loggedUserId);
        return matchesChannelName && hasLoggedUser || hasMatchingUser && hasLoggedUser;
      })
      .map(channel => channel.chanId)
  }

  /**
   * filters all messages and check if the input matches one of them or includes the input,
   * puts back the Channel in where the text is
   * 
   * @param input the input the user types in the searchbar
   * @param loggedUserId currently logged in user
   */
  filterMessagesInChannels(input: string, loggedUserId: string) {
    const channelMap = new Map(this.channelService.channels.map(chan => [chan.chanId, chan]));
    this.filteredMessagesWithChannels = this.messageService.messages
      .filter(message => {
        const channel = channelMap.get(message.channelId);
        return channel && channel.userIds.includes(loggedUserId) &&
          message.text.toLowerCase().includes(input);
      })
      .map(message => {
        const channel = channelMap.get(message.channelId);
        return {
          messageId: message.id, chanName: channel ? channel.chanName : 'Unknown',
          channelId: message.channelId, messageText: message.text,
        };
      });
  }

  /**
   * filters all messages and check if the input matches one of them or includes the input,
   * puts back the Private Message in where the text is
   * 
   * @param input the input the user types in the searchbar
   * @param loggedUserId currently logged in user
   */
  filterMessagesInPrivate(input: string, loggedUserId: string) {
    this.filteredMessagesWithPrivChat = this.messageService.messages
      .filter(message => {
        const isInvolved = message.senderId === loggedUserId || message.userId === loggedUserId;
        const matchesText = message.text.toLowerCase().includes(input);
        return isInvolved && matchesText;
      })
      .map(message => {
        return {
          messageId: message.id, messageUserId: message.userId,
          messageSenderId: message.senderId, messageText: message.text,
        }
      })
  }

  /**
   * filters all messages and check if the input matches one of them or includes the input,
   * puts back the Thread in where the text is
   * 
   * @param input the input the user types in the searchbar
   * @param loggedUserId currently logged in user
   */
  filterMessagesinThreads(input: string, loggedUserId: string) {
    this.filteredMessagesWithThreads = this.messageService.messages
      .filter(message => {
        const isInvolved = message.senderId === loggedUserId || message.userId === loggedUserId;
        const matchesText = message.text.toLowerCase().includes(input);
        return isInvolved && matchesText && message.threadId !== '';
      })
      .map(message => {
        return {
          messageId: message.id,
          messageThreadId: message.threadId || '',
          messageText: message.text,
        }
      })
  }

  /**
   * sets the filtered arrays empty if nothing matches the input from the searchbar
   */
  checkNoFindings() {
    this.filteredUsers.length = 0;
    this.filteredChannels.length = 0;
    this.filteredMessagesWithChannels.length = 0;
  }

  /**
   * opens a direct Message with another user
   * 
   * @param id the id of the other user selected
   */
  opendirectMsg(id: string) {
    this.userService.privMsgUserId = id;
    this.channelService.channelChatId = '';
    this.searchBar = '';
  }

  /**
   * opens a new channeltab
   * 
   * @param id the id of the channel selected
   */
  openChannel(id: string) {
    this.channelService.channelChatId = id;
    this.userService.privMsgUserId = '';
    this.searchBar = '';
    this.messageService.threadOpen = false;
  }

  /**
   * opens a new threadTab
   * 
   * @param id the id of the thread selected
   */
  openThread(id: string | null) {
    if (id) {
      this.messageService.threadOpen = true;
      this.channelService.channelChatId = '';
      this.userService.privMsgUserId = '';
      this.searchBar = '';
      this.messageService.threadId = id;
    }
  }
}