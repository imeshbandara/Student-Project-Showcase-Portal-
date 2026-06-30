import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { User, Mail, Shield, Calendar, Edit3, Save, Camera, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (file) {
        formData.append('avatar', file);
      }

      const { data } = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: async () => {
      setSuccess(true);
      setError(null);
      await refetch(); // Update global auth state in Navbar
      setTimeout(() => {
        setIsEditing(false);
        setSuccess(false);
        setFile(null);
        setPreview(null);
      }, 1000);
    },
    onError: (err) => {
      setError(err.response?.data?.error ?? 'Failed to update profile. Please try again.');
      setSuccess(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    updateProfileMutation.mutate();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Platform Administrator';
      case 'RECRUITER': return 'Industry Recruiter';
      default: return 'Student Innovator';
    }
  };

  const renderAvatar = () => {
    const currentAvatarUrl = user?.avatarUrl;
    
    // Determine the source URL
    let src = '';
    if (preview) {
      src = preview;
    } else if (currentAvatarUrl) {
      src = currentAvatarUrl.startsWith('http') ? currentAvatarUrl : `${API_URL}${currentAvatarUrl}`;
    }

    if (src) {
      return <img src={src} alt={user?.name} className="profile-page-avatar" referrerPolicy="no-referrer" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--clr-primary-light)' }} />;
    }

    return (
      <div className="profile-page-avatar profile-page-avatar--fallback" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-primary)', color: 'white', fontSize: '48px', fontWeight: 800, border: '3px solid var(--clr-primary-light)' }}>
        {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
    );
  };

  return (
    <div className="page-container page-container--narrow animate-fade-in">
      <div className="page-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1>My Profile</h1>
          <p className="page-subtitle">View and update your personal details and account settings.</p>
        </div>
      </div>

      <div className="home-profile-card" style={{
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Glow backdrop effect */}
        <div className="dashboard-card-glow" />

        {/* Edit Button Toggle (only show when not editing) */}
        {!isEditing && (
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={() => { setIsEditing(true); setName(user?.name || ''); }}
            style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        )}

        {/* Profile Details Area */}
        {!isEditing ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {renderAvatar()}
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{user?.name}</h2>
              <span className="role-badge" style={{ fontSize: '12px', padding: '4px 10px' }}>{getRoleLabel(user?.role)}</span>
            </div>

            <div className="profile-info-grid" style={{ width: '100%', borderTop: '1px solid var(--clr-border)', paddingTop: '24px', marginTop: '10px' }}>
              <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="var(--clr-text-muted)" />
                <div>
                  <span className="profile-info-label" style={{ display: 'block', fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Email Address</span>
                  <span className="profile-info-value" style={{ fontWeight: 600 }}>{user?.email}</span>
                </div>
              </div>
              <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={18} color="var(--clr-text-muted)" />
                <div>
                  <span className="profile-info-label" style={{ display: 'block', fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Role Permission</span>
                  <span className="profile-info-value" style={{ fontWeight: 600 }}>{user?.role}</span>
                </div>
              </div>
              <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="var(--clr-text-muted)" />
                <div>
                  <span className="profile-info-label" style={{ display: 'block', fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>Account Created</span>
                  <span className="profile-info-value" style={{ fontWeight: 600 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form Mode */
          <form onSubmit={handleSubmit} className="modal-form animate-fade-in" style={{ width: '100%', gap: '20px' }}>
            <h2 style={{ alignSelf: 'flex-start', fontSize: '18px', fontWeight: 700 }}>Modify Profile Settings</h2>
            
            {error && <div className="alert alert--danger">{error}</div>}
            {success && <div className="alert alert--success">Profile updated successfully!</div>}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative', width: '100%' }}>
              <div style={{ position: 'relative' }}>
                {renderAvatar()}
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  title="Upload New Avatar"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Supported formats: JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            <div className="form-group">
              <label htmlFor="edit-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Display Name</span>
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} />
                <span>Email Address (Not editable)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email}
                style={{ background: 'var(--clr-surface-2)', cursor: 'not-allowed', color: 'var(--clr-text-muted)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || '');
                  setFile(null);
                  setPreview(null);
                  setError(null);
                }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={updateProfileMutation.isPending}
              >
                <Save size={16} />
                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
