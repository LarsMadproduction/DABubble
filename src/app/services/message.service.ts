import { ChannelService } from './channel.service';
import { Injectable, inject, ElementRef, signal, WritableSignal } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import { addDoc, query,  orderBy,  updateDoc, deleteDoc, collection, doc,  Firestore, onSnapshot } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    userService = inject(UserService);
    channelService = inject(ChannelService);
    firestore: Firestore = inject(Firestore);
    messages: Message[] = [];
    threadId: string | null = null;
    threadChannelName: string = '';
    editMessage: Message | null = null;
    originalText: string = '';
    threadOpen: boolean = false;
    messageInput: WritableSignal<ElementRef | undefined> = signal(undefined);
    threadMessageInput: WritableSignal<ElementRef | undefined> = signal(undefined);
    unsubMessageList;

    constructor() {
        this.unsubMessageList = this.subMessageList();
    }

    focusMessageInput(): void {
        const inputRef = this.messageInput();
        inputRef?.nativeElement.focus();
    }

    focusThreadMessageInput(): void {
        const inputRef = this.threadMessageInput();
        inputRef?.nativeElement.focus();
    }

    subMessageList() {
        const q = query(
            collection(this.firestore, 'messages'), orderBy('time', 'desc')
        );
        return onSnapshot(q, (list) => {
            this.messages = list.docs.map(doc => {
                const messageData = doc.data();
                const message = this.setMessageObject(messageData, doc.id);
                return message;
            });

        });
    }


    ngOnDestroy() {
        this.unsubMessageList;
    }

    async createMessage(message: Message) {
        try {
            const docRef = await addDoc(this.getMessagesDocRef(), message);
            await updateDoc(docRef, { id: docRef.id });

            return docRef.id; 
        } catch (err) {
            console.error("Error creating message: ", err);
            throw err; 
        }
    }

    async updateMessage(message: Message) {
        if (message.id) {
            let docRef = this.getSingleMessageDocRef('messages', message.id);
            await updateDoc(docRef, this.getCleanJSON(message)).catch(
                (err) => { console.log(err); }
            ).then(
                () => { } 
            );
        }
    }

    async deleteMessage(docId: string) {
        if (docId) {
            await deleteDoc(this.getSingleMessageDocRef('messages', docId)).catch(
                (err) => { console.log(err); }
            ).then(
                () => { } 
            );
        }
    }

    getCleanJSON(message: Message): {} {
        return {
            id: message.id || '',
            senderId: message.senderId,
            text: message.text,
            time: message.time,
            reactions: message.reactions,
            channelId: message.channelId,
            userId: message.userId,
            threadId: message.threadId
        }
    }

    setMessageObject(obj: any, id: string): Message {
        return {
            id: id,
            senderId: obj.senderId,
            text: obj.text,
            time: obj.time,
            reactions: obj.reactions,
            channelId: obj.channelId,
            userId: obj.userId,
            threadId: obj.threadId
        }
    }

    getMessagesDocRef() {
        return collection(this.firestore, 'messages');
    }


    getSingleMessageDocRef(colId: string, docId: string) {
        return doc(collection(this.firestore, colId), docId);
    }
}



