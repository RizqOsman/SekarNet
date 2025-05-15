/**
 * Format a number as currency (Indonesian Rupiah)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format a datetime string to a human-readable format with time
 */
export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format a date relative to the current time (e.g., "2 hours ago", "5 minutes ago")
 */
export const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  
  // Convert to seconds
  const diffInSecs = Math.floor(diffInMs / 1000);
  
  // Less than a minute
  if (diffInSecs < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSecs < 3600) {
    const minutes = Math.floor(diffInSecs / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSecs < 86400) {
    const hours = Math.floor(diffInSecs / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSecs < 604800) {
    const days = Math.floor(diffInSecs / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Less than a month
  if (diffInSecs < 2629746) {
    const weeks = Math.floor(diffInSecs / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Less than a year
  if (diffInSecs < 31556952) {
    const months = Math.floor(diffInSecs / 2629746);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSecs / 31556952);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * Truncate a string to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format bytes to a human-readable format (KB, MB, GB)
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${value.toFixed(decimals)}%`;
};