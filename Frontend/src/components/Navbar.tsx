import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../state/auth';
import CreateCategoryModal from './CreateCategoryModal';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/20" />
          <span className="font-semibold text-lg">Forum</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'text-white' : 'text-white/80 hover:text-white'}>Feed</NavLink>
          <NavLink to="/friends" className={({ isActive }) => isActive ? 'text-white' : 'text-white/80 hover:text-white'}>Friends</NavLink>
          {isAdmin && (
            <button className="text-white/80 hover:text-white" onClick={() => setShowCategoryModal(true)}>Create Category</button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>Profile</button>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Sign up</button>
            </>
          )}
        </div>
      </div>
      {showCategoryModal && <CreateCategoryModal onClose={() => setShowCategoryModal(false)} />}
    </header>
  );
}


