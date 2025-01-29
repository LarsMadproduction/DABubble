import { User } from './../../../interfaces/user.model';
import { UserService } from './../../../services/user.service';
import { ChannelService } from './../../../services/channel.service';
import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ClickOutsideDirective } from '../../click-outside.directive';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../../services/message.service';
import { Message } from '../../../interfaces/message.interface';
import { serverTimestamp } from '@angular/fire/firestore';
import { EmojiService } from '../../../services/emoji.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [
    MatIconModule,
    ClickOutsideDirective,
    CommonModule,
  ],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})

export class ReactionBarComponent {
  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'new';
  @Input() message!: Message;
  @Input() loggedUser: string = '';
  optionsOpen: boolean = false;
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  emojiService = inject(EmojiService);
  userService = inject(UserService);
  private emojiSubscription!: Subscription;

  ngOnInit(): void {
    this.emojiSubscription = this.emojiService.emojiSelected$.subscribe(({ event, destination }) => {
      if (destination === 'reactionBar') {
        this.addEmoji(event);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }


  openEditMessage(message: Message): void {
    this.messageService.originalText = message.text;
    this.messageService.editMessage = message;
    this.closeOptions();
  }

  openThread(message: Message): void {
    const channel = this.channelService.channels.find(
      (channel) => channel.chanId === message.channelId
    );
    this.messageService.threadChannelName = channel?.chanName || '';
    this.messageService.threadId = message.id;
    this.messageService.threadOpen = true;
    this.addFirstThreadMessage(message);
    setTimeout(() => this.messageService.focusThreadMessageInput(), 0);
  }

  addFirstThreadMessage(message: Message): void {
    const existingMessage = this.messageService.messages.find(
      (msg) => msg.threadId === message.id
    );
    if (!existingMessage) {
      const newMessage: Message = {
        id: '',
        senderId: message.senderId,
        text: message.text,
        time: serverTimestamp(),
        reactions: [],
        channelId: '',
        userId: '',
        threadId: message.id
      };
      this.messageService.createMessage(newMessage);
    }
  }

  isFirstMessageInThread(msg: Message): boolean {
    if (!msg.threadId) {
      return false;
    }
    const matchingMessages = this.messageService.messages.filter(
      (message) => message.threadId === msg.threadId
    );

    const earliestMessage = matchingMessages.reduce((earliest, current) =>
      current.time < earliest.time ? current : earliest
    );
    return msg.id === earliestMessage.id;
  }

  toggleOptions(): void {
    this.optionsOpen = !this.optionsOpen;
  }

  closeOptions(): void {
    this.optionsOpen = false;
  }

  getRecentEmojis(): string[]  {
    const user = this.userService.users.find(
      (user) => user.id === this.loggedUser
    );
    if (user) {
        return user.recentEmojis;
    }
    return [];
  }

  addEmoji(event: any): void {
    const emoji = event.emoji.native;
    if(this.emojiService.reactionMessage) {
    const existingReaction = this.emojiService.reactionMessage.reactions.find(
      (reaction: { emoji: string; users: string[] }) => reaction.emoji === emoji
    );
    if (existingReaction && !this.alreadyReacted(emoji)) {
      if (!existingReaction.users.includes(this.loggedUser)) {
        existingReaction.users.push(this.loggedUser);
      }
    } else if (!this.alreadyReacted(emoji)) {
      this.emojiService.reactionMessage.reactions.push({
        emoji: emoji,
        users: [this.loggedUser],
      });
    }
    this.pushToRecentEmojis(emoji);
    this.messageService.updateMessage(this.emojiService.reactionMessage);
    console.log(this.emojiService.reactionMessage);
    this.emojiService.closeEmojiPicker();
  }
  }

  pushToRecentEmojis(emoji: string): void {
    const user = this.userService.users.find(
      (user) => user.id === this.loggedUser
    );
    if (user) {
      if (user.recentEmojis.includes(emoji)) {
        return;
      } else {
        user.recentEmojis.push(emoji);
      }
      if (user.recentEmojis.length > 2) {
       user.recentEmojis.shift();
      }
      this.userService.updateRecentEmojis(user.id, user.recentEmojis);
    }
  }


  addRecentEmoji(recentEmoji: string, message: Message): void {
    this.emojiService.reactionMessage = message;
    if (this.emojiService.reactionMessage?.reactions) {
      const reactionIndex = this.emojiService.reactionMessage.reactions.findIndex(
        (reaction: { emoji: string; users: string[] }) => reaction.emoji === recentEmoji
      );
      if (reactionIndex !== -1 && !this.alreadyReacted(recentEmoji)) {
        this.emojiService.reactionMessage.reactions[reactionIndex].users.push(this.userService.loggedUserId);
      } else if (reactionIndex === -1) {
        this.emojiService.reactionMessage.reactions.push({
          emoji: recentEmoji,
          users: [this.userService.loggedUserId]
        });
      } else if (this.alreadyReacted(recentEmoji)) {
        this.removeEmoji(recentEmoji);
      }
      this.messageService.updateMessage(this.emojiService.reactionMessage);
    }
  }

  removeEmoji(emoji: string): void {
    if (this.emojiService.reactionMessage?.reactions) {
      const reactionIndex = this.emojiService.reactionMessage.reactions.findIndex(
        (reaction: { emoji: string; users: string[] }) => reaction.emoji === emoji
      );
      if (reactionIndex !== -1) {
        const reaction = this.emojiService.reactionMessage.reactions[reactionIndex];

        reaction.users = reaction.users.filter((user: string) => user !== this.loggedUser);

        if (reaction.users.length === 0) {
          this.emojiService.reactionMessage.reactions.splice(reactionIndex, 1);
        }
      }
    }
  }

  alreadyReacted(reactedEmoji: string): boolean {
    if (!this.emojiService.reactionMessage?.reactions) {
      return false;
    }
    return this.emojiService.reactionMessage.reactions.some(
      (reaction: { emoji: string; users: string[] }) =>
        reaction.users.includes(this.loggedUser) && reaction.emoji === reactedEmoji
    );
  }

}











