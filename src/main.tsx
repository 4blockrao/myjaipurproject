import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    // This runs during SSG build and client hydration
    if (isClient) {
      // Client-side only initialization
    }
  }
);
