import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateName, changePassword, uploadAvatar, updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiCamera } from 'react-icons/fi';
import { HiMail, HiLockClosed, HiPencil, HiCheck, HiX, HiSun, HiMoon } from 'react-icons/hi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileRef = useRef(null);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Bio & Skills
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarSrc = user?.avatar && user.avatar !== 'default-avatar.png'
    ? `/uploads/avatars/${user.avatar}`
    : null;

  const handleNameSave = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingName(true);
    try {
      const res = await updateName(name.trim());
      updateUser({ name: res.data.name ?? name.trim(), nameChangesLeft: res.data.nameChangesLeft });
      toast.success('Name updated!');
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Password changed!');
      setOldPassword('');
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(formData);
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await updateProfile({ bio, skills });
      updateUser({ bio: res.data.bio ?? bio, skills: res.data.skills ?? skills });
      toast.success('Profile updated!');
      setEditingBio(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const nameChangesLeft = user?.nameChangesLeft ?? 2;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Avatar Section */}
        <div className="card profile-avatar-card">
          <div className="avatar-section">
            <div className="avatar-large" onClick={() => fileRef.current?.click()}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" />
              ) : (
                <FiUser size={48} />
              )}
              <div className="avatar-overlay">
                <FiCamera size={20} />
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              hidden
            />
            {uploadingAvatar && <p className="upload-status">Uploading...</p>}
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="profile-details">
          {/* Name */}
          <div className="card profile-section">
            <h3>Name</h3>
            <div className="profile-field">
              {editingName ? (
                <div className="edit-row">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleNameSave} disabled={savingName}>
                    <HiCheck size={16} />
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingName(false); setName(user?.name || ''); }}>
                    <HiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="display-row">
                  <span>{user?.name}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditingName(true)}
                    disabled={nameChangesLeft <= 0}
                  >
                    <HiPencil size={14} /> Edit
                  </button>
                </div>
              )}
              <p className="field-hint">{nameChangesLeft} name change{nameChangesLeft !== 1 ? 's' : ''} remaining</p>
            </div>
          </div>

          {/* Email */}
          <div className="card profile-section">
            <h3>Email</h3>
            <div className="profile-field">
              <div className="display-row">
                <span><HiMail size={16} /> {user?.email}</span>
                <span className="badge">Read-only</span>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="card profile-section">
            <h3>Password</h3>
            {showPasswordForm ? (
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="input-group">
                  <HiLockClosed className="input-icon" size={16} />
                  <input
                    type="password"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <HiLockClosed className="input-icon" size={16} />
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="btn-row">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={savingPassword}>
                    {savingPassword ? 'Saving...' : 'Change Password'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </button>
            )}
          </div>

          {/* Theme */}
          <div className="card profile-section">
            <h3>Theme</h3>
            <div className="theme-toggle-row">
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <button className="theme-switch" onClick={toggleTheme}>
                <div className={`switch-track ${theme === 'dark' ? 'dark' : ''}`}>
                  <div className="switch-thumb">
                    {theme === 'dark' ? <HiMoon size={14} /> : <HiSun size={14} />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bio & Skills */}
          <div className="card profile-section">
            <div className="card-header-row">
              <h3>Bio & Skills</h3>
              {!editingBio && (
                <button className="btn btn-outline btn-sm" onClick={() => setEditingBio(true)}>
                  <HiPencil size={14} /> Edit
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="bio-edit">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={300}
                  rows={3}
                />
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Node.js, Python..."
                />
                <div className="btn-row">
                  <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingBio(false); setBio(user?.bio || ''); setSkillsInput(user?.skills?.join(', ') || ''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              //claude --resume daba6625-7373-4f3f-ade2-40abdcd5df9d   
              <div className="bio-display">
                <p>{user?.bio || 'No bio added yet.'}</p>
                {user?.skills?.length > 0 && (
                  <div className="skill-tags">
                    {user.skills.map((s) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
