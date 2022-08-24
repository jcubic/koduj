import { useContext, useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

import { Providers, loginWithPopup, UserContext, useUserData, auth } from './lib/firebase';
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
  const { register, handleSubmit } = useForm();
  const [data, setDate] = useState<{[key: string]: string} | null>(null);
  const onSubmit = handleSubmit((data) => {
    setDate(data);
  });
  return (
    <form onSubmit={onSubmit}>
      <input {...register('Username')} placeholder="User Name"/>
      <input type="submit" value="Zapisz"/>
      <pre>{data && JSON.stringify(data)}</pre>
    </form>
  );
}
