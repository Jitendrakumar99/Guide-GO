// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Calculate days between two dates
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'confirmed': return '#4CAF50';
    case 'cancelled': return '#F44336';
    case 'completed': return '#2196F3';
    default: return '#757575';
  }
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'paid': return '#4CAF50';
    case 'refunded': return '#F44336';
    default: return '#757575';
  }
}; 