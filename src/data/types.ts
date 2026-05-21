/** Three-letter team code (e.g. "ARG", "BRA"). */
export type TeamCode = string;

/** Sticker identifier in CODE_NN format (e.g. "ARG_01"). */
export type StickerId = string;

/** Per-country visual theme derived from flag/kit colors. */
export interface CountryTheme {
  /** Display name of the country (e.g. "Argentina"). */
  name: string;
  /** Primary brand color (hex). */
  primary: string;
  /** Secondary brand color (hex). */
  secondary: string;
  /** Accent / tertiary color (hex). */
  accent: string;
  /** Text color on top of primary (hex). */
  text: string;
  /** CSS gradient string for header backgrounds. */
  gradient: string;
}

/** A single sticker in the catalog. */
export interface Sticker {
  /** Unique identifier, e.g. "BRA_01". */
  id: StickerId;
  /** Album display code, e.g. "BRA 01". */
  album_code: string;
  /** Three-letter team code, e.g. "BRA". */
  team_code: TeamCode;
  /** Full country name, e.g. "Brazil". */
  team_name: string;
  /** Position within the team album (1..20). */
  slot_index: number;
  /** Display number (1..20). */
  sticker_number: number;
  /** Sticker type: team badge or player portrait. */
  type: 'badge' | 'player';
  /** Player name or "Escudo" for badges. */
  name: string;
  /** Runtime path served from public/stickers/, e.g. "/stickers/BRA/BRA_01.png". */
  image_path: string;
}

/** Lightweight country metadata derived from the catalog. */
export interface Country {
  /** Three-letter team code. */
  teamCode: TeamCode;
  /** Full country name. */
  name: string;
  /** Ordered list of sticker IDs belonging to this country. */
  stickerIds: StickerId[];
}
