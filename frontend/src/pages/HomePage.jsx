import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * HomePage — placeholder home page for authenticated users.
 * Will be replaced with the project listing once that feature is built.
 */
export default function HomePage() {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'RECRUITER': return 'Recruiter';
      default: return 'Student';
    }
  };

  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="home-hero">
        <div className="home-hero-bg-orb home-hero-bg-orb--1" />
        <div className="home-hero-bg-orb home-hero-bg-orb--2" />

        <div className="home-hero-content">
          {/* Welcome chip */}
          <div className="home-welcome-chip">
            <span className="home-welcome-chip-dot" />
            Welcome back, {getRoleLabel(user?.role)}
          </div>

          <h1 className="home-hero-title">
            Hello,{' '}
            <span className="home-hero-name">
              {user?.name?.split(' ')[0] ?? 'there'}
            </span>{' '}
            👋
          </h1>

          <p className="home-hero-subtitle">
            {user?.role === 'RECRUITER'
              ? 'Explore innovative student projects and discover your next hire.'
              : user?.role === 'ADMIN'
              ? 'Manage the platform, users, and all project submissions.'
              : 'Share your work with the world. Showcase your projects and get discovered.'}
          </p>

          <div className="home-hero-actions">
            {user?.role === 'STUDENT' && (
              <button className="btn btn--primary" id="upload-project-btn" disabled>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upload Project
                <span className="btn-badge">Coming soon</span>
              </button>
            )}
            <button className="btn btn--secondary" id="browse-projects-btn" disabled>
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              Browse Projects
              <span className="btn-badge">Coming soon</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="home-stats">
        <div className="home-stats-grid">
          {[
            { label: 'Projects Showcased', value: '—', icon: '📁' },
            { label: 'Students', value: '—', icon: '🎓' },
            { label: 'Recruiters', value: '—', icon: '💼' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="stat-card">
              <div className="stat-card-icon">{icon}</div>
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* User info card */}
      <section className="home-profile-card">
        <h2>Your Account</h2>
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-label">Name</span>
            <span className="profile-info-value">{user?.name}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Role</span>
            <span className={`role-badge role-badge--${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
