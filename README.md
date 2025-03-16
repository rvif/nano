# Nano URL Shortener

A modern, full-stack URL shortening service with user authentication, analytics tracking, and a responsive UI.

![Nano URL Screenshot](./web/public/hero_light.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Implementation Details](#implementation-details)
- [Smart Solutions](#smart-solutions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

## 🔍 Overview

Nano URL is a URL shortening service that allows users to create shortened links, track click analytics, and manage their links through a user-friendly dashboard. The service offers user authentication, custom short URLs, and detailed analytics.

The project consists of a React-based frontend and a Go-based backend, deployed on Google Cloud Platform.

## ✨ Features

- **URL Shortening**: Create short, memorable links from long URLs
- **Custom Slugs**: Define custom URL paths instead of random strings
- **User Authentication**: Secure registration, login, and password reset
- **Analytics**: Track total clicks, daily clicks, and click history
- **Link Management**: View, edit, delete, and manage all your links
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Switch between themes based on user preference
- **Caching**: Local caching for improved performance during page reloads

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI & Themes
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Deployment**: NGINX on Google Cloud Run

### Backend

- **Language**: Go 1.24
- **Web Framework**: Gin
- **Database**: PostgreSQL 13
- **ORM**: Raw SQL with prepared statements
- **Authentication**: JWT (JSON Web Tokens)
- **Migrations**: Goose
- **Email Service**: SMTP integration
- **Deployment**: Google Cloud Run

### Infrastructure

- **Cloud Provider**: Google Cloud Platform
- **Database Hosting**: Cloud SQL (PostgreSQL)
- **Container Registry**: Google Container Registry
- **Secrets Management**: Secret Manager
- **CDN/Hosting**: Cloud Run

## 🏛️ Architecture

The application follows a modern client-server architecture:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│  React Frontend │◄─────►│    Go Backend   │◄─────►│   PostgreSQL    │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
      Cloud Run                Cloud Run                Cloud SQL
```

- **Frontend**: Single-page application built with React
- **Backend**: RESTful API built with Go and Gin framework
- **Database**: PostgreSQL for persistent storage
- **Authentication**: JWT-based authentication flow

## 🔧 Implementation Details

### Frontend

- **Component Structure**: Well-organized component hierarchy with layouts and pages
- **State Management**: Redux for global state, React hooks for local state
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Navigation**: React Router with protected routes
- **Form Handling**: Controlled components with validation
- **Error Handling**: Graceful error presentation and logging
- **Performance Optimization**: Lazy loading, code splitting, and local caching

### Backend

- **RESTful API**: Well-structured endpoints following REST principles
- **Middleware**: Authentication, CORS, and logging middleware
- **Database Access**: Secure connection with prepared statements to prevent SQL injection
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes
- **Background Services**: Daily reset service for analytics
- **Security**: JWT token validation, password hashing, and HTTPS

## 🧩 Smart Solutions

### Caching Strategy

The application implements a sophisticated caching strategy to improve user experience, especially during page reloads:

- **User data caching**: User information is cached in localStorage and loaded instantly while fresh data is fetched
- **URL data caching**: User's shortened URLs are cached locally for immediate display
- **Cache invalidation**: Proper cache invalidation on logout or when server data changes
- **Version-based cache**: App version tracking for clearing outdated caches on updates

### Daily Reset Service

A background service runs to reset daily click counters at midnight (IST):

- **Timezone Support**: Configurable timezone (default: Asia/Kolkata)
- **Automatic Scheduling**: Calculates the time until midnight and schedules resets
- **Error Handling**: Retries failed reset operations with exponential backoff
- **Graceful Shutdown**: Proper cleanup during application shutdown

### Token Refresh Mechanism

Implements a token refresh mechanism to maintain user sessions:

- **Access Tokens**: Short-lived JWT tokens for API access
- **Refresh Tokens**: Long-lived tokens stored securely for obtaining new access tokens
- **Auto-refresh**: Background refresh before token expiration
- **Graceful Degradation**: Fallback mechanisms when refresh fails

### URL Analytics

Real-time analytics tracking for shortened URLs:

- **Click Tracking**: Records total clicks, daily clicks, and last clicked timestamp
- **Aggregation**: Aggregates analytics across all user URLs
- **Visualization**: User-friendly presentation of analytics data

## 📡 API Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and receive tokens
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Initiate password reset
- `POST /api/v1/auth/reset-password` - Complete password reset

### URL Management Endpoints

- `POST /api/v1/url/shorten` - Create a shortened URL
- `POST /api/v1/url/get-urls` - Get all URLs for a user
- `POST /api/v1/url/update/:url_id` - Update a URL
- `POST /api/v1/url/delete/:short_url` - Delete a URL
- `POST /api/v1/url/analytics/:short_url` - Get analytics for a specific URL

### Other Endpoints

- `GET /api/v1/me` - Get current user information
- `GET /api/v1/analytics` - Get aggregate analytics for all user URLs
- `GET /api/v1/url/:slug` - Redirect to the original URL
- `GET /api/v1/health` - Health check endpoint

## 📊 Database Schema

The application uses several key database tables:

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    pfp_url TEXT DEFAULT '/images/default_pfp.jpg' NOT NULL,
    created_at TIMESTAMP with time zone DEFAULT now(),
    updated_at TIMESTAMP with time zone DEFAULT now()
);
```

### URLs Table

```sql
CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url text NOT NULL UNIQUE,
    short_url text NOT NULL UNIQUE,
    total_clicks INT DEFAULT 0,
    daily_clicks INT DEFAULT 0,
    last_clicked TIMESTAMP with time zone,
    created_at TIMESTAMP with time zone DEFAULT now(),
    updated_at TIMESTAMP with time zone DEFAULT now()
);
```

### User Analytics Table

```sql
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_urls INT NOT NULL DEFAULT 0,
    total_total_clicks INT NOT NULL DEFAULT 0,
    avg_daily_clicks DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP with time zone DEFAULT now(),
    updated_at TIMESTAMP with time zone DEFAULT now()
);
```

## 💻 Development Setup

### Prerequisites

- Go 1.24+
- Node.js 20+
- PostgreSQL 13+
- Docker (optional)

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/rvif/nano-url.git
   cd nano-url
   ```

2. Set up environment variables by copying `.env.example` to `.env` and filling in the values:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3. Initialize the database:

   ```bash
   goose postgres "postgres://username:password@localhost:5432/nano_url?sslmode=disable" up
   ```

4. Run the backend:
   ```bash
   go run main.go
   ```

### Frontend Setup

1. Navigate to the web directory:

   ```bash
   cd web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables by copying `.env.development` to `.env.local` if needed:

   ```bash
   cp .env.development .env.local
   # Edit .env.local if needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Backend Deployment (Google Cloud Run)

1. Enable required APIs:

   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com
   ```

2. Create a PostgreSQL instance:

   ```bash
   gcloud sql instances create urlshortener-db --tier=db-f1-micro --database-version=POSTGRES_13
   gcloud sql databases create urlshortener --instance=urlshortener-db
   gcloud sql users create urlshortener-user --instance=urlshortener-db --password=YOUR_SECURE_PASSWORD
   ```

3. Store secrets in Secret Manager:

   ```bash
   echo -n "postgres://urlshortener-user:PASSWORD@/urlshortener?host=/cloudsql/PROJECT_ID:REGION:urlshortener-db" | \
     gcloud secrets create db-url --data-file=-

   echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

   echo -n "your-smtp-username" | gcloud secrets create smtp-username --data-file=-
   echo -n "your-smtp-password" | gcloud secrets create smtp-password --data-file=-
   ```

4. Build and deploy the container:

   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/url-shortener-backend .

   gcloud run deploy url-shortener-backend \
     --image gcr.io/YOUR_PROJECT_ID/url-shortener-backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --update-secrets=DB_URL=db-url:latest,JWT_SECRET=jwt-secret:latest,SMTP_USERNAME=smtp-username:latest,SMTP_PASSWORD=smtp-password:latest \
     --set-env-vars="ENV=production" \
     --add-cloudsql-instances=YOUR_PROJECT_ID:REGION:urlshortener-db
   ```

### Frontend Deployment (Google Cloud Run)

1. Build and deploy the frontend:

   ```bash
   cd web
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/url-shortener-frontend .

   gcloud run deploy url-shortener-frontend \
     --image gcr.io/YOUR_PROJECT_ID/url-shortener-frontend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated
   ```

## 🔮 Future Improvements

1. **Enhanced Analytics**: Geographic data, referrer tracking, and device analytics
2. **QR Code Generation**: Generate QR codes for shortened URLs
3. **Link Expiration**: Set expiry dates for temporary links
4. **Bulk Operations**: Import/export and batch create/update/delete operations
5. **API Rate Limiting**: Prevent abuse with rate limiting
6. **Team Collaboration**: Allow teams to share and manage links
7. **Custom Domains**: Allow users to use their own domains
8. **Webhooks**: Notify external services when links are clicked

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Created by [Ravijeet Sharma](https://www.linkedin.com/in/ravijeet-sharma-9a75a2230/)

---

> "nano fast, nano simple" 💞
