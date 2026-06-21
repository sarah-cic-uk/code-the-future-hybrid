#!/bin/bash

# Create Test Cohort in DynamoDB
# This script creates a test cohort using AWS CLI and Amplify configuration

echo "🚀 Creating test cohort in DynamoDB..."
echo ""

# Check if amplify_outputs.json exists
if [ ! -f "public/amplify_outputs.json" ]; then
    echo "❌ Error: amplify_outputs.json not found in public/ folder"
    echo ""
    echo "💡 Make sure your Amplify sandbox is running:"
    echo "   cd amplify-backend && npx ampx sandbox"
    exit 1
fi

# Extract the API endpoint and region from amplify_outputs.json
API_ENDPOINT=$(python3 -c "import json; f=open('public/amplify_outputs.json'); data=json.load(f); print(data['data']['url'])" 2>/dev/null)
REGION=$(python3 -c "import json; f=open('public/amplify_outputs.json'); data=json.load(f); print(data['data']['aws_region'])" 2>/dev/null)
API_KEY=$(python3 -c "import json; f=open('public/amplify_outputs.json'); data=json.load(f); print(data['data']['api_key'])" 2>/dev/null)

if [ -z "$API_ENDPOINT" ] || [ -z "$API_KEY" ]; then
    echo "❌ Error: Could not extract API configuration from amplify_outputs.json"
    echo ""
    echo "💡 Make sure your Amplify sandbox is deployed successfully"
    exit 1
fi

echo "📡 API Endpoint: $API_ENDPOINT"
echo "🌍 Region: $REGION"
echo ""

# Create a properly formatted JSON payload
cat > /tmp/cohort-mutation.json << 'EOF'
{
  "query": "mutation CreateCohort { createCohort(input: { cohortCode: \"TEST2024\", name: \"Test Cohort 2024\", sessionReleaseDates: \"{\\\"session1\\\":0,\\\"session2\\\":0,\\\"session3\\\":0,\\\"session4\\\":0,\\\"session5\\\":0,\\\"session6\\\":0,\\\"session7\\\":0}\" }) { id cohortCode name sessionReleaseDates } }"
}
EOF

# Make the API call
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d @/tmp/cohort-mutation.json)

# Clean up temp file
rm -f /tmp/cohort-mutation.json

# Check if successful
if echo "$RESPONSE" | grep -q "cohortCode"; then
    echo "✅ Test cohort created successfully!"
    echo ""
    echo "📋 Cohort Details:"
    echo "─────────────────────────────────────"
    echo "Cohort Code: TEST2024"
    echo "Name: Test Cohort 2024"
    echo ""
    echo "📅 Session Release Dates:"
    echo "  All sessions available immediately (value: 0)"
    echo ""
    echo "✨ Students can now register using cohort code: TEST2024"
    echo "🔑 Tutor code: cTfTut0rCod3!1 (creates tutor accounts)"
    echo ""
elif echo "$RESPONSE" | grep -q "already exists"; then
    echo "⚠️  Cohort TEST2024 already exists!"
    echo ""
    echo "✅ This is fine - the cohort is ready to use"
    echo "✨ Students can register with cohort code: TEST2024"
    echo ""
else
    echo "❌ Error creating cohort"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Make sure Amplify sandbox is running"
    echo "   2. Check that amplify_outputs.json is up to date"
    echo "   3. Verify your AWS credentials are configured"
fi

# Made with Bob
