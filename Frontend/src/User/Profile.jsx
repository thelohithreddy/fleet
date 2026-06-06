import { useState, useEffect, useRef } from 'react'
import './Profile.css'
import useUserStore from '../../store/UserStore';
import PasswordInput from '../components/PasswordInput';

function Profile() {
  const { user, loading, error, getUserProfile, updateUserProfile, changePassword, clearError } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    profilePhoto: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        profilePhoto: user.profilePhoto || ''
      });
      setProfileImage(user.profilePhoto || null);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      await getUserProfile(`?t=${new Date().getTime()}`);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const previewURL = URL.createObjectURL(file);
    setProfileImage(previewURL);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Name is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) errors.email = 'Invalid email format';
    const phoneRegex = /^\d{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) errors.phoneNumber = 'Phone number must be 10 digits';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      clearError();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPw.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.current === pwForm.newPw) {
      setPwError('New password cannot be the same as your current password');
      return;
    }
    try {
      setPwLoading(true);
      const res = await changePassword(pwForm.current, pwForm.newPw);
      setPwSuccess(res.message || 'Password updated');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPasswordSection(false);
    } catch (err) {
      setPwError(err.response?.data?.error || err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const initials = (formData.fullName || user?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="profile-main-container">
        <div className="fleet-loading">
          <div className="fleet-spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-main-container">
      <div className="profile-container">
        <div className="fleet-page__header" style={{ marginBottom: '1.25rem' }}>
          <h1 className="fleet-page__title">My profile</h1>
          <p className="fleet-page__subtitle">Manage your account details</p>
        </div>

        <div className="profile-card">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
          />

          {!isEditing && (
            <button className="profile-edit-btn" onClick={() => { setIsEditing(true); clearError(); }} type="button">
              Edit
            </button>
          )}

          <div className="profile-card__header">
            <div
              className="profile-avatar"
              onClick={() => isEditing && fileInputRef.current?.click()}
              style={{ cursor: isEditing ? 'pointer' : 'default' }}
              title={isEditing ? 'Click to change photo' : undefined}
            >
              {profileImage ? <img src={profileImage} alt="" /> : initials}
            </div>
            <div className="profile-card__meta">
              <h2>{formData.fullName || 'Your name'}</h2>
              <p>{formData.email || user?.email}</p>
            </div>
          </div>

          {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

          <div className="profile-input-container">
            <h6 className="details">Full name</h6>
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"} ${formErrors.fullName ? 'error-input' : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
          </div>

          <div className="profile-input-container">
            <h6 className="details">Phone number</h6>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="10-digit mobile"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"} ${formErrors.phoneNumber ? 'error-input' : ''}`}
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
          </div>

          <div className="profile-input-container">
            <h6 className="details">Email</h6>
            <input
              type="email"
              name="email"
              className="profile-input-field disabled"
              value={formData.email}
              disabled
            />
          </div>

          <div className="profile-input-container">
            <h6 className="details">Date of birth</h6>
            <input
              type="date"
              name="dateOfBirth"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"}`}
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="profile-input-container">
            <h6 className="details">Address</h6>
            <input
              type="text"
              name="address"
              placeholder="Your address"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"}`}
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="profile-password-section">
            <button
              type="button"
              className="profile-password-toggle"
              onClick={() => { setShowPasswordSection((s) => !s); setPwError(''); setPwSuccess(''); }}
            >
              {showPasswordSection ? 'Hide password change' : 'Change password'}
            </button>
            {pwSuccess && <div className="profile-pw-success">{pwSuccess}</div>}
            {showPasswordSection && (
              <form onSubmit={handlePasswordSubmit} className="profile-password-form">
                {pwError && <div className="error-message">{pwError}</div>}
                <div className="profile-input-container">
                  <h6 className="details">Current password</h6>
                  <PasswordInput
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    placeholder="Current password"
                    className="profile-input-field editing"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="profile-input-container">
                  <h6 className="details">New password</h6>
                  <PasswordInput
                    value={pwForm.newPw}
                    onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                    placeholder="At least 6 characters"
                    className="profile-input-field editing"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="profile-input-container">
                  <h6 className="details">Confirm new password</h6>
                  <PasswordInput
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className="profile-input-field editing"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="profile-save-button" disabled={pwLoading}>
                  {pwLoading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="profile-save-button" onClick={handleSaveClick} type="button">
                Save changes
              </button>
              <button
                className="profile-cancel-button"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: user.fullName || '',
                    phoneNumber: user.phoneNumber || '',
                    email: user.email || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                    profilePhoto: user.profilePhoto || ''
                  });
                  setProfileImage(user.profilePhoto || null);
                  clearError();
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
