import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private emojiSelectedSubject = new Subject<any>();
  emojiSelected$ = this.emojiSelectedSubject.asObservable();
  emojiPickerOn: boolean = false;
  emojiPickerInThread: boolean = true;
  emojiDestination: 'newMessage' | 'threadMessage' | 'editMessage' | 'reaction' | 'reactionBar' = 'newMessage';
  reactionMessage: Message | null = null


  closeEmojiPicker(): void {
    this.emojiPickerOn = false;
    this.emojiPickerInThread = false
  }
  openEmojiPicker(location : 'newMessage' | 'threadMessage' | 'editMessage' | 'reaction' | 'reactionBar',
     chatType:'private' | 'channel' | 'thread' | 'new',
    message: Message | null): void {
    this.emojiPickerOn = true;
    this.emojiDestination = location
    if (message) {
      this.reactionMessage = message
    }
    if (chatType === 'thread') {
      this.emojiPickerInThread = true
    }

  }

  toggleEmojiPicker(location: 'newMessage' | 'threadMessage' | 'editMessage' | 'reaction' | 'reactionBar',
     chatType:'private' | 'channel' | 'thread' | 'new',
    message: Message | null): void {
    if (this.emojiPickerOn && this.emojiDestination === location) {
      this.closeEmojiPicker();
    } else {
      this.openEmojiPicker(location, chatType, message);
    }
  }


  addEmoji(event: any): void {
    this.emojiSelectedSubject.next({ event, destination: this.emojiDestination });
    this.closeEmojiPicker();
    console.log(event);
  }

  



}
