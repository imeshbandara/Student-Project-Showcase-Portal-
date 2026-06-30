import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT or RECRUITER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Sync url errors
  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'auth_failed') {
        setError('Google sign-in failed. Please try again.');
      } else if (errorParam === 'session_expired') {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }, [errorParam]);

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleMockLogin = async (mockRole) => {
    try {
      const mockEmail = `${mockRole.toLowerCase()}_mock@example.com`;
      const mockName = `Mock ${mockRole.charAt(0) + mockRole.slice(1).toLowerCase()}`;
      const { data } = await api.post('/auth/mock-login', { email: mockEmail, name: mockName, role: mockRole });
      login(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Mock login failed:', err);
    }
  };

  const validateEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (isRegistering && !name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // Signup call
        const { data } = await api.post('/auth/signup', {
          email,
          password,
          name: name.trim(),
          role,
        });
        login(data.user);
        navigate('/', { replace: true });
      } else {
        // Login call
        const { data } = await api.post('/auth/login', {
          email,
          password,
        });
        login(data.user);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error ?? 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-card">
        {/* Logo / brand */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#loginGrad)" />
              <path d="M20 8L31 14v12l-11 6L9 26V14L20 8z" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="4" fill="white" />
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="login-logo-text">
            <h1>Showcase</h1>
            <span>Student Project Portal</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegistering ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsRegistering(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegistering ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsRegistering(true); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="login-error animate-fade-in" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Join As</label>
              <div className="role-cards">
                <div
                  className={`role-card ${role === 'STUDENT' ? 'role-card--active' : ''}`}
                  onClick={() => setRole('STUDENT')}
                >
                  <div className="role-card-radio" />
                  <div className="role-card-content">
                    <span className="role-card-title">Student</span>
                    <span className="role-card-desc">Showcase your own innovation</span>
                  </div>
                </div>
                <div
                  className={`role-card ${role === 'RECRUITER' ? 'role-card--active' : ''}`}
                  onClick={() => setRole('RECRUITER')}
                >
                  <div className="role-card-radio" />
                  <div className="role-card-content">
                    <span className="role-card-title">Recruiter</span>
                    <span className="role-card-desc">Discover outstanding talent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn--primary login-submit-btn" disabled={loading}>
            {loading ? <div className="spinner spinner--sm" /> : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        {/* Google login button */}
        <button
          id="google-login-btn"
          className="login-google-btn"
          onClick={handleGoogleLogin}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>

        {/* Mock Login for Local Development */}
        {import.meta.env.DEV && (
          <div className="mock-login-section">
            <div className="mock-login-divider">
              <span>Or local mock login</span>
            </div>
            <div className="mock-login-buttons">
              <button
                id="mock-login-student"
                className="btn btn--secondary btn--sm"
                onClick={() => handleMockLogin('STUDENT')}
                type="button"
              >
                Student
              </button>
              <button
                id="mock-login-recruiter"
                className="btn btn--secondary btn--sm"
                onClick={() => handleMockLogin('RECRUITER')}
                type="button"
              >
                Recruiter
              </button>
              <button
                id="mock-login-admin"
                className="btn btn--secondary btn--sm"
                onClick={() => handleMockLogin('ADMIN')}
                type="button"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        <p className="login-footer">
          By signing in, you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
