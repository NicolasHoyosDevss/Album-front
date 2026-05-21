import { AlbumDashboard } from '../components/album/AlbumDashboard';
import { countries } from '../data/countries';
import { getTheme } from '../data/themes';

/**
 * Dashboard page — renders the full AlbumDashboard
 * with overall progress bar and 48-country card grid.
 */
export function DashboardPage() {
  return <AlbumDashboard countries={countries} getTheme={getTheme} />;
}
