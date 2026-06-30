import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { Sparkles, Plus, Compass, LogIn } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading } = useProjects(1, 3);
  const projects = data?.projects ?? [];

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'RECRUITER': return 'Recruiter';
      default: return 'Student';
    }
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-bg-orb home-hero-bg-orb--1" />
        <div className="home-hero-bg-orb home-hero-bg-orb--2" />

        <div className="home-hero-content">
          <div className="home-welcome-chip">
            <Sparkles size={12} className="home-welcome-chip-icon" />
            <span>{user ? `Welcome back, ${getRoleLabel(user.role)}` : 'Welcome to Showcase'}</span>
          </div>

          <h1 className="home-hero-title">
            {user ? (
              <>Hello, <span className="home-hero-name">{user.name.split(' ')[0]}</span> 👋</>
            ) : (
              <>Discover Student <span className="home-hero-name">Innovation</span> 🚀</>
            )}
          </h1>

          <p className="home-hero-subtitle">
            {user
              ? user.role === 'RECRUITER'
                ? 'Explore innovative student projects and discover your next hire.'
                : user.role === 'ADMIN'
                ? 'Manage the platform, users, and all project submissions.'
                : 'Share your work with the world. Showcase your projects and get discovered.'
              : 'Explore innovative student projects, or log in to share your own work with the world.'}
          </p>

          <div className="home-hero-actions">
            {!user ? (
              <Link to="/login" className="btn btn--primary" id="login-btn">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
            ) : user.role === 'STUDENT' ? (
              <Link to="/my-projects" className="btn btn--primary" id="upload-project-btn">
                <Plus size={16} />
                <span>My Projects</span>
              </Link>
            ) : null}
            
            <Link to="/projects" className="btn btn--secondary" id="browse-projects-btn">
              <Compass size={16} />
              <span>Browse Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent projects */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="home-section-link">View all →</Link>
        </div>
        {isLoading ? (
          <div className="page-spinner"><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet. Be the first to showcase!</p>
        ) : (
          <div className="project-grid project-grid--small">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
