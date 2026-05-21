import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { CountryAlbumPage } from '../pages/CountryAlbumPage';
import { SearchPage } from '../pages/SearchPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/country/:teamCode',
        element: <CountryAlbumPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
    ],
  },
]);
