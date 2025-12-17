# Deployment Guide - Campus Rooms

This guide covers deploying the Campus Rooms application to AWS.

## Architecture Overview

- **Frontend (React)**: Deploy to S3 + CloudFront
- **Backend (Node.js/Express)**: Deploy to AWS Elastic Beanstalk, EC2, or Lambda
- **Database**: MongoDB (can use MongoDB Atlas or self-hosted)

## Prerequisites

1. AWS CLI installed and configured (`aws configure`)
2. Node.js and npm installed
3. AWS account with appropriate permissions

## Step 1: Build Frontend for Production

```bash
cd client
npm install
npm run build
```

This creates a `dist/` folder with optimized production files.

## Step 2: Deploy Frontend to S3

### Create S3 Bucket

```bash
# Replace 'campus-rooms-app' with your unique bucket name
BUCKET_NAME="campus-rooms-app"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

### Upload Frontend Files

```bash
cd client
aws s3 sync dist/ s3://$BUCKET_NAME --delete
```

### Set Bucket Policy (Public Read Access)

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::campus-rooms-app/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
```

### Configure CORS (if needed)

```bash
aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json
```

## Step 3: Set Environment Variable for API URL

Before building, create `.env.production` in `client/`:

```env
VITE_API_URL=https://your-backend-api-url.com
```

Then rebuild:
```bash
cd client
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME --delete
```

## Step 4: Deploy Backend

### Option A: AWS Elastic Beanstalk (Recommended)

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `cd server && eb init`
3. Create environment: `eb create campus-rooms-api`
4. Set environment variables:
   ```bash
   eb setenv MONGO_URI=your_mongodb_uri JWT_SECRET=your_secret
   ```
5. Deploy: `eb deploy`

### Option B: AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Install Node.js, MongoDB (or use Atlas)
3. Clone repo and install dependencies
4. Use PM2 to run: `pm2 start src/index.js`
5. Configure security groups for port 4000

### Option C: AWS Lambda + API Gateway (Serverless)

See `serverless.yml` configuration (if created).

## Step 5: Update Frontend API URL

After backend is deployed, update `VITE_API_URL` in `.env.production` and redeploy frontend.

## Step 6: (Optional) CloudFront CDN

For better performance and HTTPS:

```bash
aws cloudfront create-distribution \
  --origin-domain-name $BUCKET_NAME.s3-website-$REGION.amazonaws.com
```

## Access Your App

- Frontend URL: `http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com`
- Or CloudFront URL if configured

## Troubleshooting

- **CORS errors**: Ensure backend CORS allows your S3/CloudFront origin
- **API not found**: Check `VITE_API_URL` is set correctly
- **404 on refresh**: Configure S3 to redirect all routes to `index.html` (already done above)


