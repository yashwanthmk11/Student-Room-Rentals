#!/bin/bash

# Campus Rooms - S3 Deployment Script
# Usage: ./deploy-s3.sh [bucket-name] [region]

BUCKET_NAME=${1:-"campus-rooms-app"}
REGION=${2:-"us-east-1"}
API_URL=${3:-"http://localhost:4000"}

echo "🚀 Deploying Campus Rooms to S3..."
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo "API URL: $API_URL"

# Step 1: Build frontend
echo "📦 Building frontend..."
cd client

# Create production env file
echo "VITE_API_URL=$API_URL" > .env.production

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

# Build
echo "🔨 Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed! dist/ folder not found."
  exit 1
fi

# Step 2: Check if bucket exists, create if not
echo "🪣 Checking S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
  echo "Creating bucket $BUCKET_NAME..."
  aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
  
  # Enable static website hosting
  aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html
  
  # Set public read policy
  cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
  aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
  
  echo "✅ Bucket created and configured"
else
  echo "✅ Bucket exists"
fi

# Step 3: Upload files
echo "📤 Uploading files to S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --region "$REGION"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app is available at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "⚠️  Remember to:"
echo "   1. Update VITE_API_URL with your backend URL"
echo "   2. Rebuild and redeploy if API URL changes"
echo "   3. Consider setting up CloudFront for HTTPS"


