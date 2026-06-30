import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  Home, 
  Compass, 
  FolderKanban, 
  Users, 
  ShieldAlert, 
  ChevronDown, 
  LogOut, 
  Terminal 
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-badge role-badge--admin';
      case 'RECRUITER': return 'role-badge role-badge--recruiter';
      default: return 'role-badge role-badge--student';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand-link">
          <div className="navbar-logo">
            <Terminal size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="navbar-brand-name">Showcase</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className="navbar-link" id="navbar-home-link">
            <Home size={15} />
            <span>Home</span>
          </Link>
          <Link to="/projects" className="navbar-link" id="navbar-projects-link">
            <Compass size={15} />
            <span>Projects</span>
          </Link>
          {isAuthenticated && (
            <>
              {user?.role === 'STUDENT' && (
                <Link to="/my-projects" className="navbar-link" id="navbar-my-projects-link">
                  <FolderKanban size={15} />
                  <span>My Projects</span>
                </Link>
              )}
              {user?.role === 'RECRUITER' && (
                <Link to="/following" className="navbar-link" id="navbar-following-link">
                  <Users size={15} />
                  <span>Following</span>
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="navbar-link" id="navbar-admin-link">
                  <ShieldAlert size={15} />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="navbar-auth-group">
              <NotificationBell />
              <div className="navbar-user" ref={dropdownRef}>
                <button
                  id="navbar-user-menu-btn"
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="navbar-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="navbar-avatar navbar-avatar--fallback">
                      {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.name}</span>
                    <span className={getRoleBadgeClass(user?.role)}>{user?.role ?? 'USER'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`navbar-chevron${dropdownOpen ? ' navbar-chevron--open' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown" role="menu">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user?.name}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <button
                      id="navbar-logout-btn"
                      className="navbar-dropdown-item navbar-dropdown-item--danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" id="navbar-login-link">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
