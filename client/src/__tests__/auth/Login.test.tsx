import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/lib/lazy-pages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useLocation hook
vi.mock('wouter', () => ({
  useLocation: () => ['/login', vi.fn()],
}));

const queryClient = new QueryClient();

describe('LoginPage', () => {
  const renderLoginPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLoginPage();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows error message on invalid credentials', async () => {
    // Mock failed login attempt
    const mockLogin = vi.fn().mockResolvedValue(false);
    vi.spyOn(useAuth(), 'login').mockImplementation(mockLogin);

    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard on successful login', async () => {
    // Mock successful login
    const mockLogin = vi.fn().mockResolvedValue(true);
    vi.spyOn(useAuth(), 'login').mockImplementation(mockLogin);
    const mockSetLocation = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => ['/', mockSetLocation],
    }));

    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'correctpass');
      expect(mockSetLocation).toHaveBeenCalledWith('/dashboard');
    });
  });
});
