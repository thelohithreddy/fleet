import { useState, useEffect, useRef } from 'react'
import './Profile.css'
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/UserStore';


function Profile() {
  const navigate = useNavigate();
  const { user, loading, error, getUserProfile, updateUserProfile, clearError } = useUserStore();
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

  // Load user profile when component mounts
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Update form data when user data changes
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
      // Add timestamp to prevent caching
      await getUserProfile(`?t=${new Date().getTime()}`);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      try {
        // Create a preview URL for immediate display
        const previewURL = URL.createObjectURL(file);
        setProfileImage(previewURL);

        // Convert image to base64 for storing
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            profilePhoto: reader.result
          }));
        };
        reader.onerror = () => {
          alert('Error reading file');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error processing image:', err);
        alert('Error uploading image. Please try again.');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    clearError();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field-specific error when user makes a change
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-main-container">
      <div className="profile-container">
        <div className="profile_BLogo_home">
          <img src="/greylogo.png" alt="🚗 FLEET" />
        </div>
        <div className="profile-card">
          <div className="profile-photo-container">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
            {isEditing && profileImage && (
              <button
                className="remove-photo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileImage(null);
                  setFormData(prev => ({
                    ...prev,
                    profilePhoto: ''
                  }));
                }}
                title="Remove photo"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="profile-input-container">
            {!isEditing && (
              <button className="profile-edit-btn" onClick={handleEditClick}>✏️</button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="profile-input-container">
            <h6 className='details'>Full Name</h6>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"} ${formErrors.fullName ? 'error-input' : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
          </div>

          <div className="profile-input-container">
            <h6 className='details'>Phone Number</h6>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"} ${formErrors.phoneNumber ? 'error-input' : ''}`}
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {formErrors.phoneNumber && <div className="error-message">{formErrors.phoneNumber}</div>}
          </div>

          <div className="profile-input-container">
            <h6 className='details'>Email</h6>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"} ${formErrors.email ? 'error-input' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={true}
            />
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
          </div>

          <div className="profile-input-container">
            <h6 className='details'>Date of Birth</h6>
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
            <h6 className='details'>Address</h6>
            <input
              type="text"
              name="address"
              placeholder="Address"
              className={`profile-input-field ${isEditing ? "editing" : "disabled"}`}
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="profile-save-button" onClick={handleSaveClick}>
                Save Changes
              </button>
              <button
                className="profile-cancel-button"
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

export default Profile