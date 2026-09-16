import React from 'react';
import { theme } from '../styles/theme';

export const WARFRAME_DAMAGE_COLORS: Record<string, string> = {
  DT_CORROSIVE_COLOR: theme.colors.corrosive,
  DT_EXPLOSION_COLOR: theme.colors.blast,
  DT_FIRE_COLOR: theme.colors.heat,
  DT_FREEZE_COLOR: theme.colors.cold,
  DT_COLD_COLOR: theme.colors.cold,
  DT_ELECTRICITY_COLOR: theme.colors.electricity,
  DT_POISON_COLOR: theme.colors.toxin,
  DT_RADIATION_COLOR: theme.colors.radiation,
  DT_RADIANT_COLOR: theme.colors.void,
  DT_MAGNETIC_COLOR: theme.colors.magnetic,
  DT_VIRAL_COLOR: theme.colors.viral,
  DT_GAS_COLOR: theme.colors.gas,
  DT_SLASH_COLOR: theme.colors.slash,
  DT_SLASH: theme.colors.slash,
  DT_PUNCTURE_COLOR: theme.colors.puncture,
  DT_IMPACT_COLOR: theme.colors.impact,
  DT_SENTIENT_COLOR: theme.colors.sentient,
};

export const WARFRAME_STAT_COLORS: Record<string, { color: string; defaultText?: string }> = {
  LOWER_IS_BETTER: { color: theme.colors.lowerIsBetter },
  UPPER_IS_BETTER: { color: theme.colors.upperIsBetter },
  HEALTH: { color: theme.colors.health, defaultText: 'Health' },
  SHIELD: { color: theme.colors.shield, defaultText: 'Shield' },
  ENERGY: { color: theme.colors.energy, defaultText: 'Energy' },
  AFFINITY_SHARE: { color: theme.colors.affinity, defaultText: 'Affinity Range' },
};

const KEY_BUTTON_MAP: Record<string, string> = {
  ACTIVATE_ABILITY_1: 'Ability 1',
  SECONDARY_FIRE: 'Secondary Fire',
  USE: 'Use',
  PRE_ATTACK: 'Fire',
};

interface TextSegment {
  key: string;
  text?: string;
  color?: string;
  isBold?: boolean;
  isKeyBadge?: boolean;
  isSeparator?: boolean;
  isLineBreak?: boolean;
}

/**
 * Strips all internal Warframe format tags and returns clean plain text.
 */
export function stripWarframeTags(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw
    .replace(/\\n/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<LINE_SEPARATOR>/g, ' · ')
    .replace(/<[A-Z0-9_/]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats Warframe game tags (<DT_...>, <LOWER_IS_BETTER>, etc.) into styled React nodes.
 */
export function formatWarframeText(raw: string | undefined | null): React.ReactNode {
  if (!raw) return null;

  // Normalize newlines and break tags
  const normalized = raw
    .replace(/\\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  // Tokenize the string
  const segments: TextSegment[] = [];
  let currentIndex = 0;
  let segId = 0;

  const scanner = /<([A-Z0-9_]+)>/g;
  let match: RegExpExecArray | null;

  while ((match = scanner.exec(normalized)) !== null) {
    const matchIndex = match.index;
    const tagName = match[1];

    // Push text before this tag
    if (matchIndex > currentIndex) {
      const textBefore = normalized.substring(currentIndex, matchIndex);
      pushTextWithLineBreaks(segments, textBefore, `txt-${segId++}`);
    }

    currentIndex = scanner.lastIndex;

    if (tagName === 'LINE_SEPARATOR') {
      segments.push({ key: `sep-${segId++}`, isSeparator: true });
      continue;
    }

    if (KEY_BUTTON_MAP[tagName]) {
      segments.push({
        key: `badge-${segId++}`,
        text: KEY_BUTTON_MAP[tagName],
        isKeyBadge: true,
      });
      continue;
    }

    if (tagName === 'LOWER_IS_BETTER' || tagName === 'UPPER_IS_BETTER') {
      const remainder = normalized.substring(currentIndex);
      const valMatch = /^([+-]?\d+(?:\.\d+)?(?:%|s|m|x)?)/.exec(remainder);
      if (valMatch) {
        segments.push({
          key: `val-${segId++}`,
          text: valMatch[1],
          color: WARFRAME_STAT_COLORS[tagName]?.color || theme.colors.green,
          isBold: true,
        });
        currentIndex += valMatch[1].length;
        scanner.lastIndex = currentIndex;
      }
      continue;
    }

    const statConfig = WARFRAME_STAT_COLORS[tagName];
    if (statConfig) {
      const remainder = normalized.substring(currentIndex);
      const statWordMatch = /^\s*([A-Za-z0-9/]+(?:\s+(?:Orbs?|Puddle|Regen|Capacity|Gate|Range))?)/.exec(remainder);
      if (statWordMatch && statWordMatch[1]) {
        segments.push({
          key: `stat-${segId++}`,
          text: statWordMatch[0],
          color: statConfig.color,
          isBold: true,
        });
        currentIndex += statWordMatch[0].length;
        scanner.lastIndex = currentIndex;
      } else if (statConfig.defaultText) {
        segments.push({
          key: `stat-${segId++}`,
          text: statConfig.defaultText,
          color: statConfig.color,
          isBold: true,
        });
      }
      continue;
    }

    const damageColor = WARFRAME_DAMAGE_COLORS[tagName];
    if (damageColor) {
      const remainder = normalized.substring(currentIndex);
      const dmgPhraseMatch = /^\s*([A-Za-z]+(?:\s+(?:Damage|Status(?:\s+Effects?|\s+Effect)?|Resistance|Status|grenade|flak|Procs?))?)/i.exec(remainder);
      if (dmgPhraseMatch && dmgPhraseMatch[1]) {
        segments.push({
          key: `dmg-${segId++}`,
          text: dmgPhraseMatch[0],
          color: damageColor,
          isBold: true,
        });
        currentIndex += dmgPhraseMatch[0].length;
        scanner.lastIndex = currentIndex;
      }
      continue;
    }
  }

  // Push any remaining text after the last tag
  if (currentIndex < normalized.length) {
    const trailing = normalized.substring(currentIndex);
    pushTextWithLineBreaks(segments, trailing, `txt-${segId++}`);
  }

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {segments.map((seg) => {
        if (seg.isLineBreak) {
          return <br key={seg.key} />;
        }
        if (seg.isSeparator) {
          return (
            <span
              key={seg.key}
              style={{
                display: 'block',
                height: 1,
                backgroundColor: theme.colors.borderDefault,
                margin: '8px 0',
              }}
            />
          );
        }
        if (seg.isKeyBadge) {
          return (
            <span
              key={seg.key}
              style={{
                display: 'inline-block',
                padding: '1px 6px',
                fontSize: '0.82em',
                fontWeight: 600,
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.bgCardHover,
                border: `1px solid ${theme.colors.borderStrong}`,
                borderRadius: 4,
                margin: '0 2px',
                verticalAlign: 'baseline',
              }}
            >
              {seg.text}
            </span>
          );
        }
        if (seg.color) {
          return (
            <span
              key={seg.key}
              style={{
                color: seg.color,
                fontWeight: seg.isBold ? 700 : 600,
              }}
            >
              {seg.text}
            </span>
          );
        }
        return <React.Fragment key={seg.key}>{seg.text}</React.Fragment>;
      })}
    </span>
  );
}

function pushTextWithLineBreaks(segments: TextSegment[], text: string, prefix: string) {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line) {
      segments.push({
        key: `${prefix}-line-${i}`,
        text: line,
      });
    }
    if (i < lines.length - 1) {
      segments.push({
        key: `${prefix}-br-${i}`,
        isLineBreak: true,
      });
    }
  });
}

