// AWS Amplify UMD Initialization
// This uses the global aws_amplify object from the UMD bundle

(function() {
  'use strict';
  
  // Load amplify_outputs.json
  fetch('/amplify_outputs.json')
    .then(response => response.json())
    .then(config => {
      // Configure Amplify using the global object
      if (window.aws_amplify && window.aws_amplify.Amplify) {
        window.aws_amplify.Amplify.configure(config);
        console.log('✅ Amplify configured successfully (UMD)');
        
        // Make Amplify modules available globally for easy access
        window.AmplifyAuth = window.aws_amplify.Auth;
        window.AmplifyData = window.aws_amplify.Data;
        window.AmplifyStorage = window.aws_amplify.Storage;
        
        console.log('✅ Amplify modules available: AmplifyAuth, AmplifyData, AmplifyStorage');
      } else {
        console.error('❌ Amplify UMD bundle not loaded');
      }
    })
    .catch(error => {
      console.error('❌ Error loading Amplify config:', error);
    });
})();

// Made with Bob
