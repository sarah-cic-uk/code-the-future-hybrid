/**
 * S3 Video Loading - Direct Public URLs
 * Now that bucket is public, we use direct URLs (faster, simpler)
 */

// Global S3 config
let s3Config = null;

// Initialize S3 config from amplify_outputs.json
async function initS3() {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    s3Config = {
      bucket: config.storage.bucket_name,
      region: config.storage.aws_region
    };
    
    console.log('✅ S3 config loaded');
    return true;
  } catch (error) {
    console.error('Failed to load S3 config:', error);
    return false;
  }
}

/**
 * Get direct public URL for a video
 * @param {string} videoName - Name of video file (e.g., 'intro-git.mp4')
 * @returns {Promise<string>} - Direct S3 URL
 */
async function getVideoUrl(videoName) {
  if (!s3Config) {
    await initS3();
  }
  
  try {
    // Direct public URL (bucket is now public)
    const url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/public/media/${videoName}`;
    return url;
  } catch (error) {
    console.error('Error getting video URL:', error);
    throw error;
  }
}

/**
 * Load video into video element
 * @param {string} videoName - Name of video file
 * @param {HTMLElement} videoElement - Video element to load into
 */
async function loadVideo(videoName, videoElement) {
  try {
    const url = await getVideoUrl(videoName);
    videoElement.src = url;
    console.log(`✅ Loaded video: ${videoName}`);
  } catch (error) {
    console.error(`Failed to load video ${videoName}:`, error);
    videoElement.src = '';
    videoElement.poster = '/images/video-error.png';
  }
}

/**
 * Fetch media from S3 (replaces Firebase version)
 * @param {string} videoName - Name of video file
 * @param {HTMLElement} element - Video element
 */
async function fetchMediaFromS3(videoName, element) {
  await loadVideo(videoName, element);
}

// Initialize on page load (no AWS SDK needed for direct URLs)
initS3();

// Expose to window for use in HTML pages
window.fetchMediaFromS3 = fetchMediaFromS3;
window.getVideoUrl = getVideoUrl;
window.loadVideo = loadVideo;

// Made with Bob
