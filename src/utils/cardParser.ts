import { Card, Rank, Suit } from '../types/poker';
import { RawCardCode } from '../types/backend';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

/**
 * Decodes a Cactus Kev 32-bit integer card encoding into UI Card:
 * - Bits 8-11: Rank (0 = '2' ... 12 = 'A')
 * - Bits 12-15: Suit bitmask (1 = Club, 2 = Diamond, 4 = Heart, 8 = Spade)
 */
export function decodeCactusKevCard(code: number): Card {
  const rankVal = (code >> 8) & 0x0f;
  const suitMask = (code >> 12) & 0x0f;

  const rank: Rank = RANKS[rankVal] ?? 'A';
  let suit: Suit = 'spades';

  switch (suitMask) {
    case 1:
      suit = 'clubs';
      break;
    case 2:
      suit = 'diamonds';
      break;
    case 4:
      suit = 'hearts';
      break;
    case 8:
      suit = 'spades';
      break;
    default:
      suit = 'spades';
  }

  return {
    rank,
    suit,
    faceUp: true,
  };
}

/**
 * Parses card representation from server (Cactus Kev object, string, or named object)
 */
export function parseCard(raw: unknown): Card | null {
  if (!raw) return null;

  // 1. Cactus Kev object: { code: 12345 }
  if (typeof raw === 'object' && raw !== null && 'code' in raw) {
    const code = (raw as RawCardCode).code;
    if (typeof code === 'number') {
      return decodeCactusKevCard(code);
    }
  }

  // 2. Object with { suit, rank }
  if (typeof raw === 'object' && raw !== null && 'rank' in raw && 'suit' in raw) {
    const r = String((raw as any).rank).trim();
    const s = String((raw as any).suit).toLowerCase().trim();

    let rank: Rank = 'A';
    const rankMap: Record<string, Rank> = {
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
      ten: 'T',
      jack: 'J',
      queen: 'Q',
      king: 'K',
      ace: 'A',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': 'T',
      t: 'T',
      j: 'J',
      q: 'Q',
      k: 'K',
      a: 'A',
    };
    if (rankMap[r.toLowerCase()]) {
      rank = rankMap[r.toLowerCase()];
    }

    let suit: Suit = 'spades';
    if (s.includes('heart') || s.includes('h') || s === '♥') suit = 'hearts';
    else if (s.includes('diamond') || s.includes('d') || s === '♦') suit = 'diamonds';
    else if (s.includes('club') || s.includes('c') || s === '♣') suit = 'clubs';
    else if (s.includes('spade') || s.includes('s') || s === '♠') suit = 'spades';

    return { rank, suit, faceUp: true };
  }

  // 3. String: "A♠", "10♦", "Kh", "2c", "10s", "As"
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s.length < 2) return null;

    let rankStr: string;
    let suitChar: string;

    if (s.startsWith('10')) {
      rankStr = 'T';
      suitChar = s.slice(2);
    } else {
      rankStr = s.charAt(0).toUpperCase();
      suitChar = s.slice(1);
    }

    let rank: Rank = 'A';
    if (RANKS.includes(rankStr as Rank)) {
      rank = rankStr as Rank;
    }

    let suit: Suit = 'spades';
    switch (suitChar.toLowerCase()) {
      case '♠':
      case 's':
        suit = 'spades';
        break;
      case '♥':
      case 'h':
        suit = 'hearts';
        break;
      case '♦':
      case 'd':
        suit = 'diamonds';
        break;
      case '♣':
      case 'c':
        suit = 'clubs';
        break;
    }

    return { rank, suit, faceUp: true };
  }

  return null;
}

/**
 * Batch parses an array of raw cards.
 */
export function parseCards(rawCards: unknown[]): Card[] {
  if (!Array.isArray(rawCards)) return [];
  return rawCards.map(parseCard).filter((c): c is Card => c !== null);
}
