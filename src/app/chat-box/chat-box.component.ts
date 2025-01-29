
import { User } from './../interfaces/user.model';
import { serverTimestamp } from 'firebase/firestore';
import { Component, Input, Inject, inject, PLATFORM_ID, HostListener, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { ClickOutsideDirective } from './click-outside.directive';
import { MessageComponent } from './message/message.component';
import { MessageService } from '../services/message.service';
import { Message } from '../interfaces/message.interface';
import { UserService } from '../services/user.service';
import { ChannelService } from '../services/channel.service';
import { SearchbarComponent } from '../header/searchbar/searchbar.component';
import { ContactWindowComponent } from '../contacts/contact-window/contact-window.component';
import { EditChannelComponent } from '../slide-side-bar/edit-channel/edit-channel.component';
import { Channel } from '../interfaces/channel.model';
import { EmojiService } from '../services/emoji.service';
import { Subscription } from 'rxjs';
import { AddUsersComponent } from './add-users/add-users.component';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [MatIconModule,
    PickerComponent,
    CommonModule,
    FormsModule,
    AutosizeModule,
    ClickOutsideDirective,
    MessageComponent,
    MessageComponent,
    ContactWindowComponent,
    EditChannelComponent,
    SearchbarComponent,
    AddUsersComponent,
  ],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.scss'
})

export class ChatBoxComponent {
  userService = inject(UserService);
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  @ViewChild('profileBox') profileBox!: ElementRef<HTMLDivElement>;
  openProfileBox = false;
  openEditChannel = false;
  addUsersToChannel = false;
  usersBoxInChannel = false;
  suggestedUsers: User[] = []; 
  suggestedChannels: Channel[] = []; 
  showSuggestions: boolean = false;
  emojiService = inject(EmojiService);
  private emojiSubscription!: Subscription;
  @Input() threadId: string | null = null;
  @Input() channelId: string = '';
  @Input() privateChatId: string = '';
  @Input() newMessage: boolean = false;
  isBrowser: boolean;
  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'new';
  @ViewChild('messageInput') private messageInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('threadMessageInput') private threadMessageInputRef!: ElementRef<HTMLInputElement>;
  @Input() userId: string = '';
  senderName: string = '';
  senderImg: string = '';
  loggedUserId: string = '';
  users: User[] = this.userService.users;
  messageText: string = '';
  guestUrl: string = '0LxX4SgAJLMdrMynLbem';
  threadMessageText: string = '';
  focusedInput: string | null = null;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef<HTMLElement>;
  excludeElements: HTMLElement[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any, private renderer: Renderer2) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.excludeElements = [this.emojiPicker.nativeElement];
    }, 0);
    if (this.messageInputRef) {
      this.messageService.messageInput.set(this.messageInputRef);
    }
    if (this.threadMessageInputRef) {
      this.messageService.threadMessageInput.set(this.threadMessageInputRef);
    }
  }

  ngOnInit(): void {
    this.emojiSubscription = this.emojiService.emojiSelected$.subscribe(({ event, destination }) => {
      if (destination === 'newMessage') {
        this.addEmojiInMessage(event);
      }
      if (destination === 'threadMessage') {
        this.addEmojiInThread(event);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }

  onInput(event: any): void {
    const inputText = event.target.value;
    const cursorPosition = event.target.selectionStart;
    const lastAtIndex = inputText.lastIndexOf('@');
    const lastHashIndex = inputText.lastIndexOf('#');
    const lastIndex = Math.max(lastAtIndex, lastHashIndex);
    if (lastIndex !== -1) {
      const searchTerm = inputText.slice(lastIndex + 1, cursorPosition); 
      if (inputText[lastIndex] === '@') {
        this.searchUsers(searchTerm); 
      } else if (inputText[lastIndex] === '#') {
        this.searchChannels(searchTerm); 
      }
    } else {
      this.showSuggestions = false;
      this.suggestedUsers = [];
      this.suggestedChannels = [];
    }
  }

  triggerAtMention(): void {
    const textareaRef = this.chatType === 'thread' ? this.messageService.threadMessageInput() : this.messageService.messageInput();
    const textarea = textareaRef?.nativeElement;
    if (!textarea) {
      return;
    }
    const model = this.chatType === 'thread' ? 'threadMessageText' : 'messageText';
    const cursorPosition = textarea.selectionStart || 0;
    const beforeCursor = this[model].slice(0, cursorPosition);
    const afterCursor = this[model].slice(cursorPosition);
    this[model] = beforeCursor + '@' + afterCursor;
    textarea.value = this[model];
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }, 0);
  }

  searchUsers(input: string): void {
    this.suggestedUsers = this.userService.users
      .filter(user => user.name.toLowerCase().includes(input.toLowerCase()));
    this.showSuggestions = this.suggestedUsers.length > 0;
  }

  searchChannels(input: string): void {
    this.suggestedChannels = this.channelService.channels
      .filter(channel =>
        channel.userIds.includes(this.userService.loggedUserId) && 
        channel.chanName.toLowerCase().includes(input.toLowerCase()) 
      );
    this.showSuggestions = this.suggestedChannels.length > 0; 
  }

  selectSuggestion(suggestion: any): void {
    const textareaRef = this.chatType === 'thread' ? this.messageService.threadMessageInput() : this.messageService.messageInput();
    const textarea = textareaRef?.nativeElement;
    if (!textarea) {
      return; 
    }
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.slice(0, cursorPosition);
    const textAfterCursor = textarea.value.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    const lastIndex = Math.max(lastAtIndex, lastHashIndex);
    let tag: string;
    let name: string;
    if (lastAtIndex > lastHashIndex) {
      tag = '@';
      name = suggestion.name; 
    } else {
      tag = '#';
      name = suggestion.chanName; 
    }
    if (!name) {
      return; 
    }
    const updatedText = textBeforeCursor.slice(0, lastIndex) + tag + name + ' ' + textAfterCursor;
    if (this.chatType === 'thread') {
      this.threadMessageText = updatedText; 
    } else {
      this.messageText = updatedText; 
    }
    setTimeout(() => {
      const newCursorPosition = lastIndex + name.length + 2; 
      textarea.value = updatedText; 
      textarea.setSelectionRange(newCursorPosition, newCursorPosition); 
      textarea.focus();
    });
    this.showSuggestions = false; 
    this.suggestedUsers = []; 
    this.suggestedChannels = []; 
  }

  groupMessagesWithSeparators(messages: Message[]): any[] {
    if (!messages || messages.length === 0) return [];
    const groupedMessages = [];
    let previousDate: Date | null = null;
    const sortedMessages = messages.sort((a, b) => {
      const timeA = a.time ? a.time.toDate().getTime() : 0;
      const timeB = b.time ? b.time.toDate().getTime() : 0;
      return timeB - timeA; 
    });
    for (let i = 0; i < sortedMessages.length; i++) {
      const message = sortedMessages[i];
      if (!message.time) {
        groupedMessages.unshift({
          type: 'message',
          data: message,
        });
        continue;
      }
      const currentDate = message.time.toDate(); 
      if (previousDate !== null && !this.isSameDay(previousDate, currentDate)) {
        groupedMessages.unshift({
          type: 'separator',
          date: this.getFormattedDate(previousDate), 
        });
      }
      groupedMessages.unshift({
        type: 'message',
        data: message,
      });
      previousDate = currentDate;
    }
    if (sortedMessages.length > 0) {
      const oldestMessage = sortedMessages[sortedMessages.length - 1];
      if (oldestMessage.time) {
        groupedMessages.unshift({
          type: 'separator',
          date: this.getFormattedDate(oldestMessage.time.toDate()),
        });
      }
    }
    return groupedMessages.reverse();
  }

  getFormattedDate(timestamp: any): string {
    const messageDate = timestamp.toDate ? timestamp.toDate() : timestamp; 
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (this.isSameDay(messageDate, today)) {
      return 'Heute';
    }
    if (this.isSameDay(messageDate, yesterday)) {
      return 'Gestern';
    }
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long', 
      day: 'numeric',  
      month: 'long',   
    }).format(messageDate);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  get filteredChannelMessages(): any[] {
    const messages = this.messageService.messages.filter(
      message => message.channelId === this.channelService.channelChatId
    );
    return this.groupMessagesWithSeparators(messages);
  }
  
  get filteredPrivateMessages(): any[] {
    const messages = this.messageService.messages.filter(
      message =>
        (message.senderId === this.userService.loggedUserId && message.userId === this.userService.privMsgUserId) ||
        (message.senderId === this.userService.privMsgUserId && message.userId === this.userService.loggedUserId)
    );
    return this.groupMessagesWithSeparators(messages);
  }
  
  get filteredThreadMessages(): Message[] {
    return this.messageService.messages.filter(
      message => message.threadId === this.threadId
    );
  }

  /**
   * a listener for mouseup event if the profileBox is active, if you click anywhere on the overlay it closes the profile box
   * 
   * @param target #profileBox
   */
  @HostListener('document:click', ['$event.target'])
  onClickOutsideProfileBox(target: HTMLElement): void {
    if (this.openProfileBox && this.profileBox) {
      let clickInsideChan = this.profileBox.nativeElement.contains(target);
      if (!clickInsideChan) { this.closeProfilBox(); }
    }
  }

  closeThread(): void {
    this.messageService.threadId = null;
    this.messageService.threadOpen = false;
    this.messageService.focusMessageInput();
  }

  countThreadAnswers(): number {
    return this.messageService.messages.filter(
      message => message.threadId === this.messageService.threadId
    ).length;
  }

  determineChatType(): 'private' | 'channel' | 'thread' | 'new' {
    if (this.newMessage) {
      return 'new';
    } else if (this.messageService.threadOpen) {
      return 'thread';
    } else if (this.channelService.channelChatId) {
      return 'channel';
    } else if (this.userService.privMsgUserId) {
      return 'private';
    }
    return 'new'; 
  }

  getPlaceholder(): string {
    const chatType = this.chatType;
    switch (chatType) {
      case 'private':
        const userName = this.getUserName();
        return `Nachricht an ${userName || 'unbekannter User'}`;
      case 'channel':
        const channelName = this.getChannelName();
        return `Nachricht an #${channelName || 'unbekannter Kanal'}`;
      case 'thread':
        return 'Antworten...';
      case 'new':
      default:
        return 'Starte eine neue Nachricht';
    }
  }

  getChannelName(): string | null {
    const channel = this.channelService.channels.find(
      (channel) => channel.chanId === this.channelService.channelChatId
    );
    return channel ? channel.chanName : null;
  }

  getUserName(): string | null {
    const user = this.userService.users.find(
      (user) => user.id === this.userService.privMsgUserId
    );
    if (user) {
      if (this.userService.privMsgUserId === this.userService.loggedUserId) {
        return `${user.name} (Du)`;
      }
      return user.name;
    }
    return null;
  }

  getUserImg(): string | null {
    const user = this.userService.users.find(
      (user) => user.id === this.userService.privMsgUserId
    );
    return user ? user.userImage : null;
  }

  getUserStatus(): string | null {
    const user = this.userService.users.find(
      (user) => user.id === this.userService.privMsgUserId
    );
    return user ? user.status : null;
  }

  getChannelMembers(): [] | any {
    const currentChannel = this.channelService.channels.find(
      (channel) => channel.chanId === this.channelService.channelChatId
    );
    if (!currentChannel || !currentChannel.userIds) {
      return []; 
    }
    const members = this.userService.users.filter((user) =>
      currentChannel.userIds.includes(user.id)
    );
    return members;
  }

  sendMessage(): void {
    if (this.messageText.trim() !== '' || this.threadMessageText.trim() !== '') {
      if (this.threadId) {
        this.sendThreadMessage();
      } else {
        this.sendMainMessage();
      }
      this.messageText = ''; 
      this.threadMessageText = ''; 
    }
  }

  sendMainMessage(): void {
    const newMessage: Message = {
      id: '',
      senderId: this.userService.loggedUserId,
      text: this.messageText,
      time: serverTimestamp(),
      reactions: [],
      channelId: this.channelService.channelChatId,
      userId: this.userService.privMsgUserId,
      threadId: ''
    };
    this.messageService.createMessage(newMessage);
  }

  sendThreadMessage(): void {
    const newMessage: Message = {
      id: '',
      senderId: this.userService.loggedUserId,
      text: this.threadMessageText,
      time: serverTimestamp(),
      reactions: [],
      channelId: '',
      userId: '',
      threadId: this.threadId
    };
    this.messageService.createMessage(newMessage);
  }

  addEmojiInThread(event: any): void {
    const emoji = event.emoji.native;
    const threadRef = this.messageService.threadMessageInput();
    const textarea = threadRef?.nativeElement
    if (textarea) {
      const cursorPosition = textarea.selectionStart || 0;
      const textBeforeCursor = textarea.value.slice(0, cursorPosition);
      const textAfterCursor = textarea.value.slice(cursorPosition);
      this.threadMessageText = textBeforeCursor + emoji + textAfterCursor;
      setTimeout(() => {
        const newCursorPosition = cursorPosition + emoji.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      });
    }
  }

  addEmojiInMessage(event: any): void {
    const emoji = event.emoji.native;
    const messageRef = this.messageService.messageInput();
    const textarea = messageRef?.nativeElement
    if (textarea) {
      const cursorPosition = textarea.selectionStart || 0;
      const textBeforeCursor = textarea.value.slice(0, cursorPosition);
      const textAfterCursor = textarea.value.slice(cursorPosition);
      this.messageText = textBeforeCursor + emoji + textAfterCursor;
      setTimeout(() => {
        const newCursorPosition = cursorPosition + emoji.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      });
    }
  }



  /**
  * opens the profile box
  */
  openProfile(id: string) {
    this.userService.profileUserId = id;
    this.openProfileBox = true;
  }

  /**
   * closes the profile box
   */
  closeProfilBox() {
    this.openProfileBox = false;
  }

  showEditChannel() {
    this.openEditChannel = true;
  }

  closeEditChannel() {
    this.openEditChannel = false;
  }

  closeDisplayUsersBox() {
    this.addUsersToChannel = false;
  }

  openDisplayUsersBox() {
    this.addUsersToChannel = true;
  }

  toggleDisplayAddBox() {
    this.usersBoxInChannel = !this.usersBoxInChannel;
  }
}
