import { useParams } from 'react-router-dom';

/**
 * Country album page — D3 will implement the full themed view
 * with StickerGrid, StickerSlot, FilterTabs, and state.
 */
export function CountryAlbumPage() {
  const { teamCode } = useParams<{ teamCode: string }>();

  return (
    <div className="text-center py-12">
      <h2 className="font-heading text-2xl font-bold text-ink mb-2">
        Country: {teamCode}
      </h2>
      <p className="text-ink-muted">
        Country album view coming in D3 &mdash; themed sticker grid with owned/missing states.
      </p>
    </div>
  );
}
