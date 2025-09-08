import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../../utils/enum';


interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: string;
}


export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default 
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Loging....
  console.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
  });


  const errorResponse = {
    success: false,
    error: {
      message,
      ...(err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
    },
  };

  
  if (err.name === 'ValidationError') {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      ...errorResponse,
      error: {
        ...errorResponse.error,
        message: 'Validation Error',
        details: err.details || err.message,
      },
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      ...errorResponse,
      error: {
        ...errorResponse.error,
        message: 'Unauthorized Access',
      },
    });
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// Helper function to create custom errors
export const createError = (
  statusCode: number,
  message: string,
  code?: string,
  details?: string
): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};