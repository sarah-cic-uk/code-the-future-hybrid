#!/bin/bash

# Start Local Development Server
# This serves your app locally so you can test with the Amplify sandbox

echo "🚀 Starting local development server..."
echo ""
echo "📋 Your app will be available at:"
echo "   http://localhost:8000"
echo ""
echo "🔗 Test pages:"
echo "   Login: http://localhost:8000/pages/login.html"
echo "   Home:  http://localhost:8000/index.html"
echo ""
echo "⚠️  Make sure your Amplify sandbox is running in another terminal!"
echo "   cd amplify-backend && npx ampx sandbox"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Start Python HTTP server in the public directory
cd public && python3 -m http.server 8000

# Made with Bob
