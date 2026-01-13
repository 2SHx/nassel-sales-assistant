#!/bin/bash

# ===========================================
# نَصِل - GCP Cloud Run Deployment Script
# ===========================================

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"
REGION="me-central1"  # Middle East region for Saudi Arabia
BACKEND_SERVICE="nassel-backend"
FRONTEND_SERVICE="nassel-frontend"

echo "🚀 نَصِل Deployment to GCP Cloud Run"
echo "======================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate if needed
echo "📋 Checking GCP authentication..."
gcloud auth print-access-token &> /dev/null || gcloud auth login

# Set project
echo "📁 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required GCP APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# ----- BACKEND DEPLOYMENT -----
echo ""
echo "🔨 Building and deploying BACKEND..."
cd backend

# Build and push using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE

# Deploy to Cloud Run
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_KEY"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed: $BACKEND_URL"

cd ..

# ----- FRONTEND DEPLOYMENT -----
echo ""
echo "🔨 Building and deploying FRONTEND..."
cd frontend

# Update API URL in environment (create .env.production)
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# Build and push using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE

# Deploy to Cloud Run
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed: $FRONTEND_URL"

cd ..

# ----- SUMMARY -----
echo ""
echo "======================================"
echo "🎉 Deployment Complete!"
echo "======================================"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo ""
echo "Next Steps:"
echo "1. Set up a custom domain in Cloud Run console"
echo "2. Configure Cloud Armor for security (optional)"
echo "3. Set up Cloud Monitoring alerts"
echo "======================================"
