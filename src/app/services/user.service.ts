import { Injectable, inject } from '@angular/core';
import { User } from '../interfaces/user.model';
import {
  addDoc,
  updateDoc,
  collection,
  doc,
  DocumentData,
  Firestore,
  onSnapshot,
  QuerySnapshot,
  query,
  where,
  getDocs,
  DocumentReference,
  Unsubscribe,
  CollectionReference,
  setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [];
  firestore: Firestore = inject(Firestore);
  userId: string = '';
  userName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  userImage: string = '';

  loggedUserId: string = '';
  privMsgUserId: string = '';
  profileUserId: string = '';

  unsubUserList;

  constructor(private router: Router, private channelService: ChannelService) {
    this.unsubUserList = this.subUserList();
  }

  /**
   * Subscribes to changes in the 'user' Firestore collection and updates the user list.
   * @returns {Unsubscribe} - A function to unsubscribe from the snapshot listener.
   */
  subUserList(): Unsubscribe {
    return onSnapshot(
      this.getallUsersdocRef(),
      (snapshot: QuerySnapshot<DocumentData>) => {
        this.users = snapshot.docs.map((doc) =>
          this.setUserObject(doc.data(), doc.id)
        );
      }
    );
  }

  /**
   * Fügt ein neues Benutzer-Dokument zu Firestore hinzu, mit einer generierten ID, wenn der Benutzer selbst registriert wurde.
   * @param {User} user - Die Benutzerdaten, die hinzugefügt werden sollen.
   * @returns {Promise<DocumentReference>} - Die Dokumentenreferenz des neu erstellten Benutzers.
   */
  async createUser(user: User): Promise<DocumentReference> {
    try {
      let docRef: DocumentReference;
      if (!user.id) {
        docRef = await addDoc(this.getallUsersdocRef(), user);
      } else {
        docRef = doc(this.getallUsersdocRef(), user.id);
        await setDoc(docRef, user);
      }

      console.log('User Data saved with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Converts Firestore document data into a User object.
   * @param {any} obj - The Firestore document data.
   * @param {string} id - The document ID.
   * @returns {User} - The constructed User object.
   */
  setUserObject(obj: any, id: string): User {
    return {
      id: id || '',
      name: obj.name || '',
      userImage: obj.userImage || '',
      email: obj.email || '',
      password: obj.password || '',
      status: obj.status || '',
      lastSeen: obj.lastSeen || new Date(),
      recentEmojis: obj.recentEmojis || [],
    };
  }

  /**
   * Retrieves the Firestore reference for the 'user' collection.
   * @returns {CollectionReference<DocumentData>} - The Firestore collection reference.
   */
  getallUsersdocRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, 'user');
  }

  /**
   * Retrieves a specific Firestore document reference in the 'user' collection.
   * @param {string} colId - The Firestore collection ID.
   * @param {string} docId - The Firestore document ID.
   * @returns {DocumentReference<DocumentData>} - The Firestore document reference.
   */
  getSingleUserDocRef(
    colId: string,
    docId: string
  ): DocumentReference<DocumentData> {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
   * Prepares and uploads a new user object to Firestore.
   */
  uploadUserData(): void {
    let newUser = this.prepareNewUser();
    this.saveUserToFirestore(newUser);
  }

  private prepareNewUser(): User {
    const userCode =
      this.userName.trim() === '' ? this.generateRandomCode() : '';
    const finalUserName =
      this.userName.trim() === '' ? 'User ' + userCode : this.userName;

    return {
      id: '',
      name: finalUserName,
      email: this.email,
      password: this.password,
      userImage: this.userImage,
      status: 'offline',
      lastSeen: new Date(),
      recentEmojis: [],
    };
  }

  generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generiert eine Zahl zwischen 100000 und 999999
  }

  /**
   * Saves the user object to Firestore.
   * @param {User} user - The user object to save.
   */
  public async saveUserToFirestore(user: User): Promise<void> {
    try {
      await this.createUser(user);
      console.log('User data successfully uploaded.');
    } catch (error) {
      console.error('Error uploading user data:', error);
    }
  }

  /**
   * Saves a Google user to Firestore.
   * If the user does not exist in Firestore, a new document is created.
   * If the user already exists, their details are updated without changing the name.
   *
   * @param {User} user - The Google user data to be saved or updated.
   * @returns {Promise<DocumentReference>} - A promise that resolves to the Firestore document reference of the user.
   * @throws {Error} - If an error occurs while saving or updating the user.
   */
  public async saveGoogleUserToFirestore(
    user: User
  ): Promise<DocumentReference> {
    try {
      const existingUserQuery = query(
        this.getallUsersdocRef(),
        where('id', '==', user.id)
      );
      const existingUserSnapshot = await getDocs(existingUserQuery);

      if (existingUserSnapshot.empty) {
        const docRef = await this.createUser(user);
        console.log('New user successfully saved.');
        return docRef;
      } else {
        const userDocId = existingUserSnapshot.docs[0].id;
        const userDocRef = this.getSingleUserDocRef('user', userDocId);

        const existingUserData = existingUserSnapshot.docs[0].data();

        await updateDoc(userDocRef, {
          email: user.email,
          userImage: user.userImage,
          status: user.status,
          lastSeen: user.lastSeen,
          recentEmojis: user.recentEmojis || [],
          name: existingUserData['name'] || user.name,
        });

        console.log('User successfully updated (Name was not changed).');
        return userDocRef;
      }
    } catch (error) {
      console.error('Error while saving user data:', error);
      throw error;
    }
  }

  /**
   * Logs in a user by validating their email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<boolean>} - True if login is successful, false otherwise.
   */
  async loginUser(email: string, password: string): Promise<boolean> {
    try {
      let querySnapshot = await this.getUserByEmail(email);
      if (querySnapshot.empty) {
        return false;
      }
      let isLoginSuccessful = await this.processLogin(querySnapshot, password);
      return isLoginSuccessful;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }

  /**
   * Retrieves a user document from Firestore by email.
   * @param {string} email - The email to query.
   * @returns {Promise<QuerySnapshot<DocumentData>>} - The query result.
   */
  private async getUserByEmail(
    email: string
  ): Promise<QuerySnapshot<DocumentData>> {
    let userRef = this.getallUsersdocRef();
    let emailQuery = query(userRef, where('email', '==', email));
    return await getDocs(emailQuery);
  }

  /**
   * Retrieves a user by their unique ID.
   *
   * @param {string} id - The unique identifier of the user to retrieve.
   * @returns {User} - The user object that matches the given ID.
   * @throws {Error} - Throws an error if no user with the given ID is found.
   */
  public getUserById(id: string): User {
    for (var i = 0; i < this.users.length; i++) {
      var user = this.users[i];
      if (user.id === id) {
        return user;
      }
    }
    throw Error("Can't find user");
  }

  /**
   * Validates user credentials and updates their status if successful.
   * @param {QuerySnapshot<DocumentData>} querySnapshot - The user query result.
   * @param {string} password - The password to validate.
   * @returns {Promise<boolean>} - True if credentials are valid, false otherwise.
   */
  private async processLogin(
    querySnapshot: QuerySnapshot<DocumentData>,
    password: string
  ): Promise<boolean> {
    for (let doc of querySnapshot.docs) {
      let userData = doc.data();
      if (userData['password'] === password) {
        await this.finalizeLogin(doc.id);
        return true;
      }
    }
    return false;
  }

  /**
   * Finalizes login by updating the user's status and navigating to the home page.
   * @param {string} userId - The logged-in user's Firestore document ID.
   */
  public async finalizeLogin(userId: string): Promise<void> {
    await this.updateUserStatus(userId, 'online');
    await this.channelService.updateStandardChannel(userId);
    setTimeout(() => {
      this.router.navigate(['/home', userId]);
    }, 1500);
  }

  /**
   * Updates the recent emojis for a specific user.
   *
   * @param {string} id - The unique identifier of the user whose recent emojis are being updated.
   * @param {string[]} recentEmojis - An array of recent emojis to be updated for the user.
   * @returns {Promise<void>} - A promise that resolves when the user info is updated successfully.
   * @throws {Error} - Catches and logs any error that occurs during the update process.
   */
  async updateRecentEmojis(id: string, recentEmojis: string[]): Promise<void> {
    try {
      let userDocRef = this.getSingleUserDocRef('user', id);
      await updateDoc(userDocRef, {
        recentEmojis: recentEmojis,
      });
      console.log('User info updated successfully.');
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }

  /**
   * Updates the user's information (name and avatar) in the database.
   *
   * @param {string} id - The unique identifier of the user whose information is being updated.
   * @param {string} name - The new name to set for the user.
   * @param {string} avatar - The new avatar image URL to set for the user.
   * @returns {Promise<void>} - A promise that resolves when the user info has been updated successfully.
   * @throws {Error} - Catches and logs any error that occurs during the update process.
   */
  async updateUserInfo(
    id: string,
    name: string,
    avatar: string
  ): Promise<void> {
    try {
      console.log(id);
      let userDocRef = this.getSingleUserDocRef('user', id);
      await updateDoc(userDocRef, {
        name: name,
        userImage: avatar,
      });
      console.log('User info updated successfully.');
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }

  /**
   * Updates a user's status and ID in Firestore.
   * @param {string} id - The user's Firestore document ID.
   * @param {string} status - The status to set.
   */
  async updateUserStatus(id: string, status: string): Promise<void> {
    try {
      let userDocRef = this.getSingleUserDocRef('user', id);
      await Promise.all([
        updateDoc(userDocRef, { status }),
        updateDoc(userDocRef, { id }),
      ]);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  /**
   * Logs out the user by setting their status to 'offline' and navigating to login.
   * @param {string} id - The user's Firestore document ID.
   */
  async logoutUser(id: string): Promise<void> {
    try {
      await this.updateUserStatus(id, 'offline');
      this.router.navigate(['']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  isValidUser(userName: string): boolean {
    const normalizedUserName = userName.toLowerCase().trim();
    const words = normalizedUserName.split(' '); // Split into words
    
    return this.users.some(user => {
      const normalizedUser = user.name.toLowerCase().trim();
      
      // Check if each word in the channel name matches a part of the channel name
      return words.every(word => normalizedUser.includes(word));
    });
  }


}
