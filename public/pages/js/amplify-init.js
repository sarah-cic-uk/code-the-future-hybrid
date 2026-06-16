import { Amplify } from 'aws-amplify';

// This will be populated after running 'npx ampx sandbox'
// Copy amplify_outputs.json from amplify-backend/ to public/
let outputs;

try {
  // Try to load the outputs file
  const response = await fetch('/amplify_outputs.json');
  if (response.ok) {
    outputs = await response.json();
    Amplify.configure(outputs);
    console.log('✅ Amplify configured successfully');
  } else {
    console.warn('⚠️ amplify_outputs.json not found. Run "npx ampx sandbox" in amplify-backend directory first.');
  }
} catch (error) {
  console.warn('⚠️ Could not load Amplify configuration:', error.message);
  console.warn('Make sure to:');
  console.warn('1. Run "cd amplify && npm install"');
  console.warn('2. Run "npx ampx sandbox"');
  console.warn('3. Copy amplify_outputs.json to public/ directory');
}

export default Amplify;

// Made with Bob
