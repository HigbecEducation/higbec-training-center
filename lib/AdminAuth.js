import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function withAdminAuth(handler) {
  return async (request, context) => {
    try {
      // Get token from cookie
      const token = request.cookies.get('admin-token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { message: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add admin info to request
      request.admin = decoded;
      
      // Call the original handler
      return handler(request, context);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 401 }
        );
      }
      
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Token expired' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function checkAdminRole(requiredRole = 'admin') {
  return (handler) => {
    return withAdminAuth(async (request, context) => {
      const userRole = request.admin.role;
      
      // Role hierarchy: superadmin > admin
      const roleHierarchy = {
        'admin': 1,
        'superadmin': 2
      };
      
      const userRoleLevel = roleHierarchy[userRole] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      
      if (userRoleLevel < requiredRoleLevel) {
        return NextResponse.json(
          { message: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, context);
    });
  };
}