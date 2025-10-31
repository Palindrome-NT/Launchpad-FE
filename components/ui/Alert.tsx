import React from 'react';
import { cn } from '../../lib/utils/cn';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  children,
  className,
  ...props
}) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Alert;
