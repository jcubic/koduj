import { useEffect, useState, createContext, FC } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  User,
  signInWithPopup,
  TwitterAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider } from 'firebase/auth';

import {
  getFirestore,
  doc,
  DocumentData,
  runTransaction,
  onSnapshot,
  collection,
  addDoc,
  QuerySnapshot,
  deleteDoc,
  DocumentReference,
  getDoc,
  orderBy,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAnBL4LigBTSe2tj8ESySO9BZ6Zm2qGxEE',
  authDomain: 'koduj-3d96a.firebaseapp.com',
  projectId: 'koduj-3d96a',
  storageBucket: 'koduj-3d96a.appspot.com',
  messagingSenderId: '484167928703',
  appId: '1:484167928703:web:4190cc25201e3f31c7284a'
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

export const Providers = {
  google: new GoogleAuthProvider()
};

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

type Provider = TwitterAuthProvider |
                GithubAuthProvider |
                FacebookAuthProvider |
                GoogleAuthProvider;

export const loginWithPopup = (provider: Provider) => {
    return signInWithPopup(auth, provider);
};

interface IUserContext {
  user?: User | null;
  username: string | null;
}

const initContext = {
  user: null,
  username: null
};

export const UserContext = createContext<IUserContext>(initContext);

export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let unsubscribe;

    if (user) {
      const ref = doc(firestore, 'users', user.uid);
      onSnapshot(ref, (doc) => {
        setUsername(doc.data()?.username);
      });
    } else {
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
}

export interface IUser {
  id: string;
  username: string;
  displayName: string;
}

export async function getUsers() {
  const usersRef = collection(firestore, 'users');
  return retriveUsers(await getDocs(usersRef));
}

type UserData = DocumentData & {id: string};

async function retriveUsers(snapshot: QuerySnapshot) {
  const users: Array<IUser> = [];
  snapshot.docs.forEach(doc => {
    users.push({...doc.data(), id: doc.id} as IUser);
  });
  return users;
}

type userDataCallback = (data: IUser[]) => void

function onUserSnapshot(ref: any, callback: userDataCallback): void {
  onSnapshot(ref, async (snapshot: QuerySnapshot) => {
    const users = await retriveUsers(snapshot);
    callback(users);
  });
}


export async function onUsers(callback: userDataCallback) {
  const usersRef = collection(firestore, 'users');
  onUserSnapshot(usersRef, callback);
}

export async function setUserSettings(user: User, settings: Required<IUser>) {
  const { uid } = user;
  const userRef = doc(firestore, 'users', uid);
  const usernameRef = doc(firestore, 'usernames', settings.username);
  const userDoc = await getDoc(userRef);
  const username = userDoc.exists() ? userDoc.data().username : null;
  const oldUsernameRef = username && doc(firestore, 'usernames', username);
  return runTransaction(firestore, async (transaction) => {
    const sfUserDoc = await transaction.get(userRef);
    const sfUsernameDoc = await transaction.get(usernameRef);
    if (sfUsernameDoc.exists()) {
      throw new Error('User already exists');
    } else {
      if (oldUsernameRef && settings.username !== username) {
        transaction.delete(oldUsernameRef);
      }
      transaction.set(usernameRef, { uid });
    }
    if (sfUserDoc.exists()) {
      transaction.update(userRef, settings);
    } else {
      transaction.set(userRef, settings);
    }
  });
}

export async function getUser(uid: string) {
  const usersRef = doc(firestore, 'users', uid);
  const snapshot = await getDoc(usersRef);
  return snapshot.data();
}

export async function onUserFilter(name: string, callback: userDataCallback) {
  const usersRef = collection(firestore, 'users');
  const q = query(
    usersRef,
    where('displayName', '==', name),
    orderBy('displayName')
  );
  onUserSnapshot(q, callback);
}
