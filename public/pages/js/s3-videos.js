/**
 * S3 Video Loading using AWS SDK
 * Simple, reliable approach without ES modules
 */

// Global S3 client
let s3Client = null;
let s3Config = null;

// Initialize S3 from amplify_outputs.json
async function initS3() {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    s3Config = {
      bucket: config.storage.bucket_name,
      region: config.storage.aws_region
    };
    
    // Configure AWS SDK
    AWS.config.region = s3Config.region;
    
    // Use Cognito Identity for unauthenticated access
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.auth.identity_pool_id
    });
    
    s3Client = new AWS.S3({
      region: s3Config.region,
      params: { Bucket: s3Config.bucket }
    });
    
    console.log('✅ S3 client initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize S3:', error);
    return false;
  }
}

/**
 * Get signed URL for a video
 * @param {string} videoName - Name of video file (e.g., 'intro-git.mp4')
 * @returns {Promise<string>} - Signed URL
 */
async function getVideoUrl(videoName) {
  if (!s3Client) {
    await initS3();
  }
  
  try {
    const params = {
      Bucket: s3Config.bucket,
      Key: `media/${videoName}`,
      Expires: 3600 // 1 hour
    };
    
    const url = s3Client.getSignedUrl('getObject', params);
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

// Initialize on page load
if (typeof AWS !== 'undefined') {
  initS3();
} else {
  console.error('AWS SDK not loaded. Include: <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1544.0.min.js"></script>');
}

// Expose to window for use in HTML pages
window.fetchMediaFromS3 = fetchMediaFromS3;
window.getVideoUrl = getVideoUrl;
window.loadVideo = loadVideo;

// Made with Bob
