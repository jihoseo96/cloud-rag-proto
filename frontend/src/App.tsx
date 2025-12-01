/**
 * App.tsx
 * 
 * 애플리케이션의 최상위 컴포넌트
 * - React Router Provider
 * - Global Context Provider  
 * - 라우팅 설정
 * v2025.11.30 - Updated to Light Theme
 */

import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <Toaster />
      </AppProvider>
    </BrowserRouter>
  );
}