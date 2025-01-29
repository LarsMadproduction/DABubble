import { Timestamp } from "@angular/fire/firestore";

export interface Message {
    id: string; 
    senderId: string; 
    text: string; 
    time: Timestamp | any;
    reactions: Reaction[]; 
    channelId: string;
    userId: string;
    threadId: string | null;
}

export interface Reaction {
  emoji: string; 
  users: string[];
}





