export type GameVariant = 'dynamic' | 'standalone';

export interface GameMeta {
  id: string;
  path: string;
  translationKey: string;
  variant?: GameVariant;
}

export const GAME_CATALOG: GameMeta[] = [
  { id: 'tictactoe', path: '/game/tictactoe', translationKey: 'tictactoe' },
  { id: 'card-flip', path: '/game/card-flip', translationKey: 'card-flip' },
  { id: 'guess-the-number', path: '/game/guess-the-number', translationKey: 'guess-the-number' },
  { id: 'merge-dice', path: '/game/merge-dice', translationKey: 'merge-dice' },
  { id: 'maze-escape', path: '/game/maze-escape', translationKey: 'maze-escape' },
  { id: 'mafia', path: '/game/mafia', translationKey: 'mafia', variant: 'standalone' },
  { id: 'color-reaction', path: '/game/color-reaction', translationKey: 'color-reaction' },
  { id: 'snake-game', path: '/game/snake-game', translationKey: 'snake-game' },
  { id: '2048-game', path: '/game/2048-game', translationKey: '2048-game' },
  { id: 'block-dodger', path: '/game/block-dodger', translationKey: 'block-dodger' },
  { id: 'rock-paper-scissors', path: '/game/rock-paper-scissors', translationKey: 'rock-paper-scissors' },
  { id: 'word-puzzle', path: '/game/word-puzzle', translationKey: 'word-puzzle' },
  { id: 'click-challenge', path: '/game/click-challenge', translationKey: 'click-challenge' },
  { id: 'simon-game', path: '/game/simon-game', translationKey: 'simon-game' },
  { id: 'mini-chess', path: '/game/mini-chess', translationKey: 'mini-chess' },
  { id: 'math-quiz', path: '/game/math-quiz', translationKey: 'math-quiz' },
  { id: 'color-match', path: '/game/color-match', translationKey: 'color-match' },
  { id: 'number-pyramid', path: '/game/number-pyramid', translationKey: 'number-pyramid' },
  { id: 'daily-mission', path: '/game/daily-mission', translationKey: 'daily-mission' },
  { id: 'speed-typing', path: '/game/speed-typing', translationKey: 'speed-typing' },
  { id: 'hangman-game', path: '/game/hangman-game', translationKey: 'hangman-game' }
];

export const DYNAMIC_GAME_CATALOG = GAME_CATALOG.filter(
  (game) => game.variant !== 'standalone'
);

export type DynamicGameId = (typeof DYNAMIC_GAME_CATALOG)[number]['id'];

export const GAME_META_BY_ID = new Map(GAME_CATALOG.map((game) => [game.id, game]));

export const isDynamicGameId = (value: string): value is DynamicGameId =>
  DYNAMIC_GAME_CATALOG.some((game) => game.id === value);
