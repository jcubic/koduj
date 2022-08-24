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
import { getFirestore, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
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
