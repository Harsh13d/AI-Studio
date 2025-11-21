import { AuthForm } from './components/AuthForm';
import { Studio } from './components/Studio';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { token } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-12">
        {token ? <Studio /> : <AuthForm />}
      </div>
    </main>
  );
};

export default App;
