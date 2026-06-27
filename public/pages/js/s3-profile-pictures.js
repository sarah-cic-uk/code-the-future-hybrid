/**
 * S3 Profile Pictures - Authenticated upload & presigned read
 * Bucket has Block Public Access on, so reads use presigned URLs
 * signed with the logged-in user's Cognito Identity Pool credentials.
 * Requires the AWS SDK v2 (aws-sdk-2.x.min.js) to be loaded first.
 */

let _s3Config = null;
let _credentialsReady = null;

async function getS3Config() {
  if (_s3Config) return _s3Config;
  const response = await fetch('/amplify_outputs.json');
  const config = await response.json();
  _s3Config = {
    bucket: config.storage.bucket_name,
    region: config.storage.aws_region,
    identityPoolId: config.auth.identity_pool_id,
    userPoolId: config.auth.user_pool_id,
    userPoolClientId: config.auth.user_pool_client_id
  };
  return _s3Config;
}

// Refresh the Cognito idToken using the stored refresh token
async function refreshIdToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token - please log in again');

  const config = await getS3Config();
  const cognito = new AWS.CognitoIdentityServiceProvider({ region: config.region });
  const result = await cognito.initiateAuth({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: config.userPoolClientId,
    AuthParameters: { REFRESH_TOKEN: refreshToken }
  }).promise();

  const newIdToken = result.AuthenticationResult.IdToken;
  localStorage.setItem('idToken', newIdToken);
  if (result.AuthenticationResult.AccessToken) {
    localStorage.setItem('accessToken', result.AuthenticationResult.AccessToken);
  }
  return newIdToken;
}

// Establish AWS credentials from the user's Cognito session (cached per page load)
async function ensureCredentials(forceRefresh = false) {
  if (_credentialsReady && !forceRefresh) return _credentialsReady;

  _credentialsReady = (async () => {
    const config = await getS3Config();
    const idToken = await refreshIdToken();

    const logins = {};
    logins[`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`] = idToken;

    AWS.config.region = config.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.identityPoolId,
      Logins: logins
    });

    await AWS.config.credentials.getPromise();
    return new AWS.S3({ region: config.region });
  })();

  return _credentialsReady;
}

// Upload a profile picture blob for a user
async function uploadProfilePicture(userId, blob) {
  const config = await getS3Config();
  const s3 = await ensureCredentials();

  await s3.putObject({
    Bucket: config.bucket,
    Key: `public/profile-pictures/${userId}`,
    Body: blob,
    ContentType: 'image/jpeg'
  }).promise();
}

// Get a presigned (authenticated) URL to read a user's profile picture.
// Returns null if the object doesn't exist or the user has no photo.
async function getProfilePictureUrl(userId) {
  if (!userId) return null;

  try {
    const config = await getS3Config();
    const s3 = await ensureCredentials();
    const key = `public/profile-pictures/${userId}`;

    // Confirm the object exists first so we can fall back to a default
    await s3.headObject({ Bucket: config.bucket, Key: key }).promise();

    return s3.getSignedUrl('getObject', {
      Bucket: config.bucket,
      Key: key,
      Expires: 3600
    });
  } catch (error) {
    if (error.code === 'NotFound' || error.code === 'NoSuchKey' || error.statusCode === 404) {
      return null;
    }
    console.error(`Error getting profile picture URL for ${userId}:`, error);
    return null;
  }
}

// Cache a presigned URL for the nav-bar avatar with an expiry, and apply it.
// URLs are signed for 1hr; cache for 55 min to stay safely valid.
function cacheNavAvatar(url) {
  if (!url) return;
  localStorage.setItem('profilePicUrl', url);
  localStorage.setItem('profilePicUrlExpiry', String(Date.now() + 55 * 60 * 1000));
  document.querySelectorAll('#profile-pic-avatar').forEach(el => el.src = url);
}

// Expose to window
window.profilePictures = {
  uploadProfilePicture,
  getProfilePictureUrl,
  ensureCredentials,
  cacheNavAvatar
};
