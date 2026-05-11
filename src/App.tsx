import { RouterProvider } from 'react-router';
import { createHashRouter } from 'react-router';
import { LandingPage } from '@/pages/Landing';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { ChatPage } from '@/pages/Chat';

const router = createHashRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/chat', Component: ChatPage },
  { path: '/chat/:sessionId', Component: ChatPage },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
