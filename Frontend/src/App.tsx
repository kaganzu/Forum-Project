import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-6 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-purple-100 py-6 text-center text-sm text-neutral-500">
        Built for Forum • Purple & White Theme
      </footer>
    </div>
  );
}


