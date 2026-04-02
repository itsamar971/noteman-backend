# Render Deployment Instructions

## Setup

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the following settings:

### Build Command
```
chmod +x renderBuild.sh && ./renderBuild.sh
```

### Start Command
```
node dist/index.js
```

### Environment Variables
Make sure to set the following environment variables:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL database URL 

### Additional Settings
- Set "Auto-Deploy" to "Yes" (if you want automatic deployments from your repo)

## Troubleshooting

If you encounter a blank pink/salmon screen:

1. Check if your database is properly set up by navigating to `/api/diagnostic` on your deployment URL
2. Make sure all environment variables are set correctly
3. Verify the application was built properly by checking the build logs
4. If using custom domains, ensure they are properly configured

## Possible Issues

1. **Database Connection**: Ensure your DATABASE_URL environment variable is correctly set and the database is accessible from Render's servers.

2. **Build Path**: This application has been configured to handle various build path configurations, but if issues persist, inspect the build logs.

3. **Server Errors**: Check the logs in the Render dashboard for any startup errors.