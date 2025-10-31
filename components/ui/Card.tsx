import React from 'react';
import { cn } from '../../lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
