/**
 * App.tsx
 * 
 * 애플리케이션의 최상위 컴포넌트
 * - React Router Provider
 * - Global Context Provider
 * - 라우팅 설정
 */

import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
