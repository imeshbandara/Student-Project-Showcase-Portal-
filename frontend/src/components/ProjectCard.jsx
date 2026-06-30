import { Link } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProjectCard({ project }) {
  const thumb = project.thumbnailUrl
    ? `${API_URL}${project.thumbnailUrl}`
    : null;

  return (
    <Link to={`/projects/${project.id}`} className="project-card" id={`project-card-${project.id}`}>
      <div className="project-card-thumb">
        {thumb ? (
          <img src={thumb} alt={project.title} />
        ) : (
          <div className="project-card-thumb-placeholder">
            <ImageOff size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <div className="project-card-meta">
          <div className="project-card-student">
            {project.student?.avatarUrl ? (
              <img src={getAvatarUrl(project.student.avatarUrl)} alt="" className="project-card-student-avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="project-card-student-avatar project-card-student-avatar--fallback">
                {project.student?.name?.charAt(0) ?? '?'}
              </div>
            )}
            <span>{project.student?.name ?? 'Unknown'}</span>
          </div>
          <div className="project-card-likes">
            <Heart size={13} fill="currentColor" />
            <span>{project._count?.likes ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
