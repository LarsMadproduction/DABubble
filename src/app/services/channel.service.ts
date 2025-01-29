import { Injectable, inject } from '@angular/core';
import { Channel } from '../interfaces/channel.model';
import { addDoc, updateDoc, deleteDoc, collection, doc, DocumentData, Firestore, onSnapshot, QuerySnapshot, arrayUnion, } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  channels: Channel[] = [];
  isServer: boolean = true;
  slideOutNavBar: boolean = false;
  createChannelBox: boolean = false;
  isSmallScreen: boolean = false;
  channelChatId: string = '';

  firestore: Firestore = inject(Firestore);
  chanId: string = '';
  chanName: string = '';
  chanDescription: string = '';
  chanCreatedByUser: string = '';
  userIds: string[] = [];

  guestChannelId: string = 'x0yH7Gmb4rUjwzLYYocC'


  unsubChannelList;

  constructor() {
    this.unsubChannelList = this.subChannelList();
  }

  /**
   * Subscribes to changes in the 'channel' Firestore collection and updates the channels in the list
   *
   * @returns A function to unsubscribe from the snapshot listener
   */
  subChannelList() {
    return onSnapshot
      (this.getallChannelsdocRef(),
        (snapshot: QuerySnapshot<DocumentData>) => {
          this.channels = snapshot.docs.map((doc) =>
            this.setChannelObject(doc.data(), doc.id)
          );
        }
      );
  }

  /**
   * sets the channel id
   * 
   * @param id the id from the channel
   */
  setChannelId(id: string) {
    this.chanId = id;
  }

  /**
   * unsubsribes the channels
   */
  ngOnDestroy() {
    this.unsubChannelList;
  }

  /**
   * Adds a new channel document to firestore with a generated ID
   * 
   * @param channel the channel data to add
   */
  async createChannel(channel: Channel): Promise<void> {
    try {
      const docRef = await addDoc(this.getallChannelsdocRef(), channel);
      this.finalizeChannel(docRef.id);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * adds the channel id to the channel after creating it 
   * 
   * @param chanId the id that firestore has given to the channel
   */
  async finalizeChannel(chanId: string): Promise<void> {
    try {
      let channelDocRef = this.getSingleChannelDocRef('channel', chanId);
      await updateDoc(channelDocRef, { chanId });
      this.channelChatId = chanId;
    } catch (error) {
      console.error('Error updating channel status:', error);
    }
  }

  /**
   * adds the addedUser Array to the Channel userIds and updates in the firestore
   * 
   * @param chanId id of the channel that the users are getting added
   * @param addedUsers the added User Array
   */
  async updateUserinChannel(chanId: string, addedUsers: string[]): Promise<void> {
    try {
      const channelDocRef = this.getSingleChannelDocRef('channel', chanId);
      await updateDoc(channelDocRef, {
        userIds: arrayUnion(...addedUsers),
      });
    } catch (error) {
      console.error('Error updating channel users:', error);
    }
  }

  /**
   * updates the channel with all the new inputs given by the user
   * 
   * @param channel 
   */
  async updateChannel(channel: Channel) {
    if (channel.chanId) {
      let docRef = this.getSingleChannelDocRef('channel', channel.chanId);
      await updateDoc(docRef, this.getCleanJSON(channel)).catch(
        (err) => { console.error(err); }
      ).then(
        () => { }
      );
    }
  }

  /**
   * updates a new User to the standard channel
   */
  async updateStandardChannel(id: string) {
    const guestChannel = this.channels.find(channel => channel.chanId === this.guestChannelId);
    if (!guestChannel?.userIds.includes(id)) {
      try {
        const channelDocRef = this.getSingleChannelDocRef('channel', this.guestChannelId);
        await updateDoc(channelDocRef, {
          userIds: arrayUnion(id),
        });
      } catch (error) {
        console.error('Error updating channel users:', error);
      }
    }
  }

  /**
   * deletes the channel from the firestore
   * 
   * @param docId 
   */
  async deleteChannel(docId: string) {
    if (docId) {
      await deleteDoc(this.getSingleChannelDocRef('channel', docId)).catch(
        (err) => { console.error(err); }
      ).then(
        () => { } //Hier Update Funktioniert Modul
      );
    }
  }

  /**
   * gets a clean JSON Array for channel
   * 
   * @param channel the channel that the user submits
   * @returns a clean JSON Array
   */
  getCleanJSON(channel: Channel): {} {
    return {
      chanId: channel.chanId,
      chanName: channel.chanName,
      chanDescription: channel.chanDescription,
      chanCreatedByUser: channel.chanCreatedByUser,
      userIds: channel.userIds,
    }
  }

  /**
   * Sets a new Channel Object and puts it into an array
   * 
   * @param obj the object with the informations from the user
   * @param id the id given by the firebase
   * @returns a compelte Channel Array
   */
  setChannelObject(obj: any, id: string): Channel {
    return {
      chanId: id || '',
      chanName: obj.chanName,
      chanDescription: obj.chanDescription,
      chanCreatedByUser: obj.chanCreatedByUser,
      userIds: obj.userIds,
    }
  }

  /**
   * gets the Current Channel Object stored as values and puts them into an Object
   * 
   * @returns returns the channel Object for Creating the channel
   */
  getCurChanObj() {
    return {
      chanId: '',
      chanName: this.chanName,
      chanDescription: this.chanDescription,
      chanCreatedByUser: this.chanCreatedByUser,
      userIds: this.userIds,
    }
  }

  /**
   * get all the channels reference from the firestore
   * 
   * @returns collection of all references of 'channel'
   */
  getallChannelsdocRef() {
    return collection(this.firestore, 'channel');
  }

  /**
   * gets a single document reference from the firestore
   * 
   * @param colId the id of the collection
   * @param docId the document id
   * @returns the document with the given id from the firestore
   */
  getSingleChannelDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  isValidChannel(channelName: string): boolean {
    console.log(channelName); // Useful for debugging, but can be removed in production
  
    // Use .some() for better performance
    return this.channels.some(channel => 
      channel.chanName.toLowerCase() === channelName.toLowerCase()
    );
  }
}