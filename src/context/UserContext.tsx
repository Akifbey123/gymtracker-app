import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useUserStore, type User } from '../store/useUserStore';

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, login, logout, isLoading, isAuthenticated, syncWithLocalStorage } = useUserStore();

  // Initial sync
  useEffect(() => {
    syncWithLocalStorage();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};