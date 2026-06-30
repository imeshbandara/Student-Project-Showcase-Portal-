import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useMyProjects } from '../hooks/useProjects';
import ProjectFormModal from '../components/ProjectFormModal';
import api from '../api/axiosInstance';
import { Plus, FilePlus, Edit2, Trash2, FolderPlus, ImageOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useMyProjects(user?.id);
  const projects = data?.projects ?? [];
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingProject(null); setShowForm(true); };
  const openEdit = (p) => { setEditingProject(p); setShowForm(true); };

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id="create-project-btn">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state-box">
          <FolderPlus size={48} strokeWidth={1.5} />
          <h3>No projects yet</h3>
          <p>Showcase your work by creating your first project.</p>
          <button className="btn btn--primary" onClick={openCreate}>
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="my-projects-list">
          {projects.map((p) => (
            <div key={p.id} className="my-project-row">
              <div className="my-project-thumb">
                {p.thumbnailUrl ? (
                  <img src={`${API_URL}${p.thumbnailUrl}`} alt={p.title} />
                ) : (
                  <div className="my-project-thumb-placeholder">
                    <ImageOff size={20} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="my-project-info">
                <h3>{p.title}</h3>
                <p>{p.description.substring(0, 100)}{p.description.length > 100 ? '...' : ''}</p>
                <span className="my-project-date">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="my-project-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)}>
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(p)}>
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Project</h2>
            <p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn btn--danger"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
