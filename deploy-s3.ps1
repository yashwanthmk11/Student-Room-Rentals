# Campus Rooms - S3 Deployment Script (PowerShell)
# Usage: .\deploy-s3.ps1 -BucketName "campus-rooms-app" -Region "us-east-1" -ApiUrl "http://localhost:4000"

param(
    [string]$BucketName = "campus-rooms-app",
    [string]$Region = "us-east-1",
    [string]$ApiUrl = "http://localhost:4000"
)

Write-Host "🚀 Deploying Campus Rooms to S3..." -ForegroundColor Cyan
Write-Host "Bucket: $BucketName"
Write-Host "Region: $Region"
Write-Host "API URL: $ApiUrl"

# Step 1: Build frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
Set-Location client

# Create production env file
"VITE_API_URL=$ApiUrl" | Out-File -FilePath .env.production -Encoding utf8

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed! dist/ folder not found." -ForegroundColor Red
    exit 1
}

# Step 2: Check if bucket exists, create if not
Write-Host "`n🪣 Checking S3 bucket..." -ForegroundColor Yellow
$bucketExists = aws s3 ls "s3://$BucketName" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating bucket $BucketName..." -ForegroundColor Yellow
    aws s3 mb "s3://$BucketName" --region "$Region"
    
    # Enable static website hosting
    aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html
    
    # Set public read policy
    $policy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Sid = "PublicReadGetObject"
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "arn:aws:s3:::$BucketName/*"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $policy | Out-File -FilePath "$env:TEMP\bucket-policy.json" -Encoding utf8
    aws s3api put-bucket-policy --bucket "$BucketName" --policy "file://$env:TEMP\bucket-policy.json"
    
    Write-Host "✅ Bucket created and configured" -ForegroundColor Green
} else {
    Write-Host "✅ Bucket exists" -ForegroundColor Green
}

# Step 3: Upload files
Write-Host "`n📤 Uploading files to S3..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://$BucketName" --delete --region "$Region"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at:" -ForegroundColor Cyan
Write-Host "   http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor White
Write-Host "`n⚠️  Remember to:" -ForegroundColor Yellow
Write-Host "   1. Update VITE_API_URL with your backend URL"
Write-Host "   2. Rebuild and redeploy if API URL changes"
Write-Host "   3. Consider setting up CloudFront for HTTPS"

Set-Location ..


