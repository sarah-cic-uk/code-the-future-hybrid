import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

/**
 * Amplify Storage Module
 * Replaces Firebase Storage with AWS Amplify Storage (S3)
 */

// ============================================
// PROFILE PICTURE OPERATIONS
// ============================================

export async function uploadProfilePicture(userId, file) {
  try {
    const result = await uploadData({
      path: `profile-pictures/${userId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Profile picture upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfilePictureUrl(userId) {
  try {
    const result = await getUrl({
      path: `profile-pictures/${userId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get profile picture URL error:', error);
    return null;
  }
}

export async function deleteProfilePicture(userId) {
  try {
    await remove({
      path: `profile-pictures/${userId}`
    });
    return { success: true };
  } catch (error) {
    console.error('Delete profile picture error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TUTOR AVATAR OPERATIONS
// ============================================

export async function uploadTutorAvatar(tutorId, file) {
  try {
    const result = await uploadData({
      path: `tutor-avatars/${tutorId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Tutor avatar upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Tutor avatar upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getTutorAvatarUrl(tutorId) {
  try {
    const result = await getUrl({
      path: `tutor-avatars/${tutorId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get tutor avatar URL error:', error);
    return null;
  }
}

// ============================================
// TUTOR PROFILE OPERATIONS
// ============================================

export async function uploadTutorProfile(tutorId, file) {
  try {
    const result = await uploadData({
      path: `tutor-profiles/${tutorId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Tutor profile upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Tutor profile upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getTutorProfileUrl(tutorId) {
  try {
    const result = await getUrl({
      path: `tutor-profiles/${tutorId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get tutor profile URL error:', error);
    return null;
  }
}

// ============================================
// SESSION IMAGE OPERATIONS
// ============================================

export async function uploadSessionImage(sessionId, file) {
  try {
    const result = await uploadData({
      path: `session-images/${sessionId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Session image upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Session image upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getSessionImageUrl(sessionId) {
  try {
    const result = await getUrl({
      path: `session-images/${sessionId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get session image URL error:', error);
    return null;
  }
}

// ============================================
// JOB CATEGORY IMAGE OPERATIONS
// ============================================

export async function uploadJobCategoryImage(categoryId, file) {
  try {
    const result = await uploadData({
      path: `job-categories/${categoryId}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Job category image upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Job category image upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getJobCategoryImageUrl(categoryId) {
  try {
    const result = await getUrl({
      path: `job-categories/${categoryId}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get job category image URL error:', error);
    return null;
  }
}

// ============================================
// PUBLIC FILE OPERATIONS
// ============================================

export async function uploadPublicFile(fileName, file) {
  try {
    const result = await uploadData({
      path: `public/${fileName}`,
      data: file,
      options: {
        contentType: file.type
      }
    }).result;
    
    console.log('Public file upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Public file upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getPublicFileUrl(fileName) {
  try {
    const result = await getUrl({
      path: `public/${fileName}`
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get public file URL error:', error);
    return null;
  }
}

export async function deletePublicFile(fileName) {
  try {
    await remove({
      path: `public/${fileName}`
    });
    return { success: true };
  } catch (error) {
    console.error('Delete public file error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// LIST OPERATIONS
// ============================================

export async function listFiles(path) {
  try {
    const result = await list({
      path: path
    });
    return result.items;
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

export async function listProfilePictures() {
  return await listFiles('profile-pictures/');
}

export async function listTutorAvatars() {
  return await listFiles('tutor-avatars/');
}

export async function listTutorProfiles() {
  return await listFiles('tutor-profiles/');
}

export async function listSessionImages() {
  return await listFiles('session-images/');
}

export async function listJobCategoryImages() {
  return await listFiles('job-categories/');
}

export async function listPublicFiles() {
  return await listFiles('public/');
}

// ============================================
// GENERIC OPERATIONS
// ============================================

export async function uploadFile(path, file, contentType) {
  try {
    const result = await uploadData({
      path: path,
      data: file,
      options: {
        contentType: contentType || file.type
      }
    }).result;
    
    console.log('File upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('File upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getFileUrl(path) {
  try {
    const result = await getUrl({ path });
    return result.url.toString();
  } catch (error) {
    console.error('Get file URL error:', error);
    return null;
  }
}

export async function deleteFile(path) {
  try {
    await remove({ path });
    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, error: error.message };
  }
}

// Export for global access (backward compatibility)
if (typeof window !== 'undefined') {
  window.amplifyStorage = {
    // Profile pictures
    uploadProfilePicture,
    getProfilePictureUrl,
    deleteProfilePicture,
    // Tutor avatars
    uploadTutorAvatar,
    getTutorAvatarUrl,
    // Tutor profiles
    uploadTutorProfile,
    getTutorProfileUrl,
    // Session images
    uploadSessionImage,
    getSessionImageUrl,
    // Job category images
    uploadJobCategoryImage,
    getJobCategoryImageUrl,
    // Public files
    uploadPublicFile,
    getPublicFileUrl,
    deletePublicFile,
    // List operations
    listFiles,
    listProfilePictures,
    listTutorAvatars,
    listTutorProfiles,
    listSessionImages,
    listJobCategoryImages,
    listPublicFiles,
    // Generic operations
    uploadFile,
    getFileUrl,
    deleteFile
  };
}

// Made with Bob
