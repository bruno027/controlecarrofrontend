import RoutesApp from './routes/routes';

import UserProvider from './contexts/user';

function App() {
  return (
    <UserProvider>
      <div>
        <RoutesApp/>
      </div>
    </UserProvider>
    
  );
}

export default App;
