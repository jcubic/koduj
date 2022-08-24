import KodujLogo from './assets/logo.svg';
import styled from 'styled-components';

const Logo = styled.img`
  width: 300px;
  display: block;
`;

function App() {
  return (
    <div className="App">
      <Logo src={KodujLogo} alt="Koduj Logo" />
    </div>
  );
}

export default App;
