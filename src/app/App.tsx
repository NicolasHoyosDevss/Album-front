import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAlbumStore } from '../stores/albumStore';

export function App() {
  const loadFromStorage = useAlbumStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return <RouterProvider router={router} />;
}
