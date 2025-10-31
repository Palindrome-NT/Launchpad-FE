export const setUserRoleCookie = (role: string) => {
  if (typeof document === 'undefined') return;
  
  // Set cookie with same domain and path as other auth cookies
  document.cookie = `userRole=${role}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
};

export const clearUserRoleCookie = () => {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
};

