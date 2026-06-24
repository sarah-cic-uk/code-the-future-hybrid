/**
 * Amplify Storage Module (UMD Version)
 * Handles S3 operations for file uploads/downloads
 * Uses global window.AmplifyStorage object
 */

// Wait for Amplify to be initialized
function waitForAmplify() {
  return new Promise((resolve) => {
    if (window.AmplifyStorage) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.AmplifyStorage) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Upload file to S3
async function uploadFile(path, file, options = {}) {
  await waitForAmplify();
  
  try {
    const result = await window.AmplifyStorage.uploadData({
      path: path,
      data: file,
      options: {
        contentType: file.type,
        ...options
      }
    }).result;
    
    console.log('Upload successful:', result);
    return { success: true, path: result.path };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

// Get file URL from S3
async function getFileUrl(path) {
  await waitForAmplify();
  
  try {
    const result = await window.AmplifyStorage.getUrl({
      path: path
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get URL error:', error);
    return null;
  }
}

// Delete file from S3
async function deleteFile(path) {
  await waitForAmplify();
  
  try {
    await window.AmplifyStorage.remove({
      path: path
    });
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

// List files in a path
async function listFiles(path) {
  await waitForAmplify();
  
  try {
    const result = await window.AmplifyStorage.list({
      path: path
    });
    return result.items || [];
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

// Upload profile picture
async function uploadProfilePicture(userId, file) {
  return uploadFile(`profile-pictures/${userId}`, file);
}

// Get profile picture URL
async function getProfilePictureUrl(userId) {
  return getFileUrl(`profile-pictures/${userId}`);
}

// Delete profile picture
async function deleteProfilePicture(userId) {
  return deleteFile(`profile-pictures/${userId}`);
}

// Get video URL from media folder
async function getVideoUrl(videoPath) {
  // Videos are stored in media/* folder with public read access
  return getFileUrl(`media/${videoPath}`);
}

// Make functions available globally
window.amplifyStorage = {
  uploadFile,
  getFileUrl,
  deleteFile,
  listFiles,
  uploadProfilePicture,
  getProfilePictureUrl,
  deleteProfilePicture,
  getVideoUrl
};

console.log('✅ Amplify Storage helpers loaded (UMD)');

// Made with Bob
