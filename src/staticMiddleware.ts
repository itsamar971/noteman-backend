import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { getBuildPath } from './buildHelper';

export function createStaticMiddleware() {
  const router = express.Router();
  
  // Add middleware to detect and handle missing static files
  router.use((req: Request, res: Response, next: NextFunction) => {
    // Skip for API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip for assets that definitely exist
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
      return next();
    }
    
    // For other routes, check if we should serve the index.html
    const buildPath = getBuildPath();
    
    // If it's not a direct file request, serve index.html
    if (!req.path.includes('.')) {
      return res.sendFile(path.join(buildPath, 'index.html'));
    }
    
    next();
  });
  
  return router;
}