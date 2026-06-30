import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useLike } from '../hooks/useLike';
import { useFollow } from '../hooks/useFollow';
import { useAuth } from '../context/AuthContext';
import { Heart, GitFork, ArrowLeft, UserPlus, UserMinus, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: project, isLoading, isError } = useProject(id);
  const { like, unlike } = useLike(id);
  const studentId = project?.student?.id;
  const { follow, unfollow } = useFollow(studentId);

  // Track like/follow state locally since the API doesn't return hasLiked/isFollowing
  const [hasLiked, setHasLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (project) {
      setLikeCount(project._count?.likes ?? project.likes?.length ?? 0);
      setHasLiked(project.hasLiked ?? false);
      setIsFollowing(project.isFollowing ?? false);
    }
  }, [project]);

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      unlike.mutate(undefined, {
        onError: () => { setHasLiked(true); setLikeCount((c) => c + 1); },
      });
    } else {
      setHasLiked(true);
      setLikeCount((c) => c + 1);
      like.mutate(undefined, {
        onError: () => { setHasLiked(false); setLikeCount((c) => Math.max(0, c - 1)); },
      });
    }
  };

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      unfollow.mutate(undefined, {
        onError: () => { setIsFollowing(true); },
      });
    } else {
      setIsFollowing(true);
      follow.mutate(undefined, {
        onError: () => { setIsFollowing(false); },
      });
    }
  };


  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;
  if (isError || !project) return <div className="page-center"><p className="empty-state">Project not found.</p></div>;

  const thumb = project.thumbnailUrl ? `${API_URL}${project.thumbnailUrl}` : null;

  return (
    <div className="page-container">
      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to projects</span>
      </Link>

      <div className="detail-layout">
        <div className="detail-main">
          {thumb && (
            <div className="detail-thumbnail">
              <img src={thumb} alt={project.title} />
            </div>
          )}

          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-description">{project.description}</p>

          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="detail-repo-link">
              <GitFork size={16} />
              <span>View Repository</span>
            </a>
          )}

          <div className="detail-meta">
            <span className="detail-date">
              <Calendar size={14} />
              <span>
                Posted {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </span>
          </div>
        </div>

        <div className="detail-sidebar">
          {/* Like button */}
          <button
            className={`detail-action-btn ${hasLiked ? 'detail-action-btn--liked' : ''}`}
            onClick={handleLike}
            disabled={!user}
            id="like-button"
          >
            <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
            <span className="detail-action-label">{hasLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Student info */}
          <div className="detail-student-card">
            <div className="detail-student-info">
              {project.student?.avatarUrl ? (
                <img src={project.student.avatarUrl} alt="" className="detail-student-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="detail-student-avatar detail-student-avatar--fallback">
                  {project.student?.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div>
                <p className="detail-student-name">{project.student?.name}</p>
                <p className="detail-student-email">{project.student?.email}</p>
              </div>
            </div>

            {user && user.id !== studentId && (
              <button
                className={`btn ${isFollowing ? 'btn--secondary' : 'btn--primary'} detail-follow-btn`}
                onClick={handleFollow}
                id="follow-button"
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={15} />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
