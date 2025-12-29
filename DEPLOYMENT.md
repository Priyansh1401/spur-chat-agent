# Deployment Guide

This guide covers deploying the Spur AI Chat Agent to production environments.

## Quick Deploy Options

### Option 1: Render (Recommended for Full-Stack)

#### Backend on Render

1. **Create PostgreSQL Database**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - New → PostgreSQL
   - Name: `spur-chat-db`
   - Free plan is fine for testing
   - Copy the "Internal Database URL" after creation

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Name**: `spur-chat-backend`
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build && npm run migrate`
     - **Start Command**: `npm start`
   
3. **Environment Variables**
   ```
   DATABASE_URL=<your-internal-database-url>
   ANTHROPIC_API_KEY=<your-api-key>
   LLM_PROVIDER=anthropic
   LLM_MODEL=claude-sonnet-4-20250514
   LLM_MAX_TOKENS=1024
   NODE_ENV=production
   FRONTEND_URL=<your-frontend-url>
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://spur-chat-backend.onrender.com`)

#### Frontend on Render

1. **Create Static Site**
   - New → Static Site
   - Connect your GitHub repository
   - Settings:
     - **Name**: `spur-chat-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=<your-backend-url>
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Your frontend will be live at `https://spur-chat-frontend.onrender.com`

### Option 2: Railway

#### Full-Stack Deploy

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd spur-chat-agent
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add --plugin postgresql
   ```

4. **Deploy Backend**
   ```bash
   cd backend
   railway up
   ```

5. **Deploy Frontend**
   ```bash
   cd ../frontend
   railway up
   ```

6. **Set Environment Variables**
   - Go to Railway dashboard
   - Add all required environment variables
   - Redeploy services

### Option 3: Vercel (Frontend) + Render/Railway (Backend)

#### Backend on Render/Railway
Follow steps from Option 1 or 2 above.

#### Frontend on Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```

   Or use Vercel Dashboard:
   - Go to [vercel.com](https://vercel.com)
   - New Project
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=<your-backend-url>
   ```

### Option 4: AWS (Production-Grade)

#### Backend on AWS ECS/Fargate

1. **Containerize Backend**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Push to ECR**
   ```bash
   aws ecr create-repository --repository-name spur-chat-backend
   docker build -t spur-chat-backend ./backend
   docker tag spur-chat-backend:latest <ecr-url>/spur-chat-backend:latest
   docker push <ecr-url>/spur-chat-backend:latest
   ```

3. **Create ECS Service**
   - Use Fargate launch type
   - Configure RDS PostgreSQL
   - Set environment variables via AWS Secrets Manager
   - Configure Application Load Balancer

#### Frontend on AWS S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/
   ```

3. **Configure CloudFront**
   - Create distribution pointing to S3 bucket
   - Set up custom domain with Route 53
   - Enable HTTPS with ACM certificate

## Database Migration on Deploy

### Automatic Migration (Recommended)

Add to your build command:
```bash
npm install && npm run build && npm run migrate
```

### Manual Migration

```bash
# SSH into your server or use Railway/Render shell
cd backend
npm run migrate
```

## Environment Variables Checklist

### Backend Required
- ✅ `DATABASE_URL` or individual DB credentials
- ✅ `ANTHROPIC_API_KEY`
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URL` (for CORS)

### Backend Optional
- `PORT` (default: 3001)
- `LLM_PROVIDER` (default: anthropic)
- `LLM_MODEL` (default: claude-sonnet-4-20250514)
- `LLM_MAX_TOKENS` (default: 1024)

### Frontend Required
- ✅ `VITE_API_URL` (your backend URL)

## Post-Deployment Checklist

- [ ] Test chat functionality end-to-end
- [ ] Verify database connection
- [ ] Test session persistence
- [ ] Check error handling
- [ ] Verify CORS settings
- [ ] Test on mobile devices
- [ ] Monitor API usage and costs
- [ ] Set up logging/monitoring (Sentry, LogRocket)
- [ ] Configure rate limiting in production
- [ ] Set up backup strategy for database

## Monitoring & Maintenance

### Health Check Endpoint
```bash
curl https://your-backend-url/api/health
```

### Database Backup

```bash
# Render/Railway
# Use platform's built-in backup feature

# AWS RDS
aws rds create-db-snapshot --db-instance-identifier spur-chat-db --db-snapshot-identifier spur-chat-backup-$(date +%Y%m%d)
```

### Logs

```bash
# Render
render logs --app spur-chat-backend

# Railway
railway logs

# Vercel
vercel logs
```

## Troubleshooting

### Backend Won't Start
1. Check DATABASE_URL is correctly set
2. Verify ANTHROPIC_API_KEY is valid
3. Check logs for migration errors
4. Ensure PORT is not already in use

### Frontend Can't Reach Backend
1. Verify VITE_API_URL is correct
2. Check CORS settings match frontend URL
3. Ensure backend is running and accessible
4. Check browser console for errors

### Database Connection Issues
1. Verify connection string format
2. Check database is running
3. Verify network access (security groups, firewalls)
4. Check connection pool settings

### LLM API Errors
1. Verify API key is valid
2. Check API usage limits
3. Monitor rate limiting
4. Check model availability

## Scaling Considerations

### Horizontal Scaling
- Backend is stateless and can scale horizontally
- Use load balancer (AWS ALB, Nginx)
- Increase database connection pool
- Consider Redis for session storage

### Performance Optimization
- Enable database connection pooling
- Add Redis caching for conversation history
- Implement CDN for frontend assets
- Use database read replicas for heavy traffic

### Cost Optimization
- Use smaller instances and scale as needed
- Implement request caching
- Set LLM max tokens appropriately
- Monitor and optimize database queries

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Secure API keys in environment variables
- [ ] Implement rate limiting
- [ ] Add request size limits
- [ ] Enable CORS with specific origins
- [ ] Use database connection pooling
- [ ] Sanitize user inputs
- [ ] Set up proper error handling
- [ ] Enable security headers
- [ ] Regular dependency updates

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Review platform-specific documentation
5. Check GitHub issues or create a new one
