import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import {
  Providers,
  loginWithPopup,
  UserContext,
  useUserData,
  onUsers,
  IUser,
  setUserSettings,
  auth,
  getUser
} from './lib/firebase';
import { DocumentData } from 'firebase/firestore';

import KodujLogo from './assets/logo.svg';

const Logo = styled.img`
  width: 300px;
  display: block;
`;

function Home() {
  const {username, user} = useContext(UserContext);
  return (
    <div className="App">
      <Logo src={KodujLogo} alt="Koduj Logo" />
      <GoogleLoginButton/><LogoutButton/>
      {user && <pre>{user.displayName}</pre>}
      {username && <p>Welcome {username}</p>}
      <TestUser/>
      <SettingsForm/>
    </div>
  );
}

function App() {
  const userData = useUserData();

  return (
    <UserContext.Provider value={userData}>
      <Home/>
    </UserContext.Provider>
  );
}

export default App;

function GoogleLoginButton() {
  const signInWithGoogle = async () => {
    try {
      await loginWithPopup(Providers.google);
    } catch(e) {
      console.log(e);
    }
  };
  return <button onClick={signInWithGoogle}>Google</button>;
}

function LogoutButton() {
  return <button onClick={() => auth.signOut()}>logout</button>;
}

function SettingsForm() {
  const { register, reset, handleSubmit } = useForm<IUser>();
  const [users, setUsers] = useState<Array<IUser>>();
  const [data, setData] = useState<DocumentData>();
  const {username, user} = useContext(UserContext);

  useEffect(() => {
    if (user) {
      getUser(user.uid).then(setData);
    }
  }, [user]);

  useEffect(() => {
    onUsers(setUsers);
  }, []);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data]);

  const onSubmit = handleSubmit(data => {
    if (user) {
      setUserSettings(user, data);
    }
  });
  return (
    <form onSubmit={onSubmit}>
      <input {...register('username')} placeholder="User Name" />
      <input {...register('displayName')} placeholder="Display Name" />
      <input type="submit" value="Zapisz"/>
      <pre>: {data && JSON.stringify(data)}</pre>
      <pre>: {username && username}</pre>
      <p>(</p>
      <ul>
        {users?.map(user => <li key={user.id}><pre>{ JSON.stringify(user) }</pre></li>)}
      </ul>
      <p>)</p>
      <pre>{ JSON.stringify(user, null, 4) }</pre>
    </form>
  );
}

function TestUser() {
  const [data, setData] = useState<DocumentData>();
  const { username } = useContext(UserContext);
  useEffect(() => {
    if (username) {
      getUser(username).then(setData);
    }
  }, [username]);
  return <pre>{JSON.stringify(data)}</pre>;
}
