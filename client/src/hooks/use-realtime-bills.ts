import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// WebSocket connection
let socket: WebSocket | null = null;

interface Bill {
  id: number;
  period: string;
  amount: number;
  dueDate: string;
  status: string;
  description: string;
}

// Function to fetch bills from API
const fetchBills = async (token: string): Promise<Bill[]> => {
  const response = await fetch('/api/v1/bills/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  
  return response.json();
};

// Connect to WebSocket
const connectWebSocket = (token: string, onMessage: (data: any) => void) => {
  if (socket === null) {
    // Connect to WebSocket server with token for authentication
    socket = new WebSocket(`ws://${window.location.hostname}:8000/ws?token=${token}`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      socket = null;
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  return () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };
};

// Custom hook for realtime bills data
export const useRealtimeBills = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch bills with React Query
  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ['bills'],
    queryFn: () => fetchBills(token || ''),
    enabled: !!token,
    // Refetch every 30 seconds as a fallback if WebSocket fails
    refetchInterval: 30000,
  });
  
  // Set up WebSocket for realtime updates
  useEffect(() => {
    if (!token) return;
    
    // Handle incoming WebSocket messages
    const handleMessage = (data: any) => {
      // If it's a payment update, refetch bills
      if (data.type === 'payment_update' || data.type === 'bill_update') {
        queryClient.invalidateQueries({ queryKey: ['bills'] });
      }
    };
    
    // Connect to WebSocket
    const disconnect = connectWebSocket(token, handleMessage);
    
    // Cleanup on unmount
    return disconnect;
  }, [token, queryClient]);
  
  return {
    bills,
    isLoading,
    error,
  };
};
