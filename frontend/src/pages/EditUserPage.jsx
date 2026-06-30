import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { getAvatarUrl } from '../utils/avatar';
import { ArrowLeft, Save, Shield, User, Mail, ShieldAlert } from 'lucide-react';

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch current user details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: async () => {
      const { data: resData } = await api.get(`/users/${id}`);
      return resData.user;
    },
    enabled: !!id,
  });

  // Pre-populate form once data is loaded
  useEffect(() => {
    if (data) {
      setName(data.name || '');
      setEmail(data.email || '');
      setRole(data.role || 'STUDENT');
    }
  }, [data]);

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data: resData } = await api.put(`/users/${id}`, updatedData);
      return resData;
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      // Invalidate related queries so changes reflect immediately everywhere
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });

      // Automatically go back to admin dashboard after a delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    },
    onError: (err) => {
      setError(err.response?.data?.error ?? 'Failed to update user details. Please try again.');
      setSuccess(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    updateMutation.mutate({ name: name.trim(), email: email.trim(), role });
  };

  if (isLoading) {
    return (
      <div className="page-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="empty-state-box animate-fade-in" style={{ padding: '40px' }}>
          <ShieldAlert size={48} color="var(--clr-danger)" />
          <h3>User not found</h3>
          <p>Could not retrieve details for this user ID. It might have been deleted.</p>
          <Link to="/admin" className="btn btn--secondary" style={{ marginTop: '15px' }}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <Link to="/admin" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', marginBottom: '12px', fontSize: '13px' }}>
            <ArrowLeft size={14} />
            <span>Back to Admin Panel</span>
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="var(--clr-primary-light)" />
            <span>Edit User Account</span>
          </h1>
          <p className="page-subtitle">Modify profile fields or switch permissions for this user.</p>
        </div>
      </div>

      {/* Form Container */}
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-md)'
      }} className="animate-fade-in">
        
        {error && (
          <div className="alert alert--danger" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert--success" style={{ marginBottom: '20px' }}>
            User updated successfully! Redirecting back to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" style={{ gap: '20px' }}>
          {/* Avatar & Joined Date Overview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--clr-border)', marginBottom: '10px' }}>
            {data.avatarUrl ? (
              <img src={getAvatarUrl(data.avatarUrl)} alt="" className="admin-student-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%' }} referrerPolicy="no-referrer" />
            ) : (
              <div className="admin-student-avatar admin-student-avatar--fallback" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '18px' }}>
                {data.name?.charAt(0) ?? '?'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{data.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Registered on {new Date(data.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="user-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              <span>Full Name</span>
            </label>
            <input
              id="user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-email" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} />
              <span>Email Address</span>
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-role" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} />
              <span>System Role</span>
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-surface-2)',
                color: 'var(--clr-text)',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="STUDENT">Student (Creator)</option>
              <option value="RECRUITER">Recruiter (Hiring/Tracking)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Link to="/admin" className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={updateMutation.isPending}
            >
              <Save size={16} />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
