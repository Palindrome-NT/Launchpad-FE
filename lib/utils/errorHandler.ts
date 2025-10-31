export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error.length > 0 ? error : 'Something went wrong. Please try again.';
  }

  if (error.data?.message) {
    return error.data.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data?.errors) {
    if (Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join(', ');
    }
    return error.response.data.errors;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Something went wrong. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.message === 'Network Error';
};

export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};
