/**
 * AlecaFrame lastData.dat Decryption & Parsing Utilities
 * Supports AES-128-CBC decryption across modern browsers (Web Crypto API) and Node.js.
 */

export const ALECA_KEY_STRING = 'LEO-ALEC\tEO-ALEC';
export const ALECA_IV_BYTES = new Uint8Array([49, 50, 70, 71, 66, 51, 54, 45, 76, 69, 51, 45, 113, 61, 57, 0]);

export interface AlecaItemBase {
  ItemType: string;
  ItemId?: { $oid: string } | string;
  XP?: number;
  Polarized?: number;
  ItemCount?: number;
  UpgradeVer?: number;
}

export interface AlecaSuit extends AlecaItemBase {
  Features?: number;
  ConfigPreset?: number;
}

export interface AlecaWeapon extends AlecaItemBase {
  ModularParts?: string[];
  Configs?: Array<{
    Pols?: string[];
    Upgrades?: Array<{ ItemType: string; UpgradeVer?: number }>;
  }>;
}

export interface AlecaRecipe {
  ItemType: string;
  ItemCount: number;
}

export interface AlecaMiscItem {
  ItemType: string;
  ItemCount: number;
}

export interface AlecaXPInfo {
  ItemType: string;
  XP: number;
}

export interface AlecaInventory {
  PlayerLevel?: number;
  RegularCredits?: number;
  PremiumCreditsFree?: number;
  FusionPoints?: number;
  PrimeTokens?: number;
  TradesRemaining?: number;
  Suits?: AlecaSuit[];
  LongGuns?: AlecaWeapon[];
  Pistols?: AlecaWeapon[];
  Melee?: AlecaWeapon[];
  SpaceGuns?: AlecaWeapon[];
  SpaceMelee?: AlecaWeapon[];
  SpaceSuits?: AlecaSuit[];
  Sentinels?: AlecaItemBase[];
  SentinelWeapons?: AlecaWeapon[];
  MechSuits?: AlecaSuit[];
  MechLongGuns?: AlecaWeapon[];
  MechMelee?: AlecaWeapon[];
  MoaSuits?: AlecaItemBase[];
  PlexusCustoms?: AlecaItemBase[];
  Horses?: AlecaItemBase[];
  OperatorAmps?: AlecaWeapon[];
  Recipes?: AlecaRecipe[];
  MiscItems?: AlecaMiscItem[];
  Upgrades?: Array<{ ItemType: string; ItemCount: number; UpgradeVer?: number }>;
  XPInfo?: AlecaXPInfo[];
  DailyStanding?: number;
  FocusPoints?: Record<string, number>;
  [key: string]: unknown;
}

export interface AlecaProfilePayload {
  AccountId?: string;
  DisplayName?: string;
  InventoryJson?: string | AlecaInventory;
  inventory?: AlecaInventory;
  [key: string]: unknown;
}

/**
 * Decrypts raw byte data from AlecaFrame lastData.dat file.
 */
export async function decryptAlecaData(encryptedData: ArrayBuffer | Uint8Array): Promise<string> {
  const cipherBytes = encryptedData instanceof Uint8Array ? encryptedData : new Uint8Array(encryptedData);

  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(ALECA_KEY_STRING);

    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: ALECA_IV_BYTES,
      },
      cryptoKey,
      cipherBytes as unknown as BufferSource
    );

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(decryptedBuffer);
  }

  try {
    const nodeCrypto = await import('crypto');
    const keyBuffer = Buffer.from(ALECA_KEY_STRING, 'utf8');
    const ivBuffer = Buffer.from(ALECA_IV_BYTES);
    const decipher = nodeCrypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
    decipher.setAutoPadding(true);
    const inputBuf = Buffer.from(cipherBytes);
    const decrypted = Buffer.concat([decipher.update(inputBuf), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    throw new Error(`Failed to decrypt AlecaFrame data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Parses and unwraps decrypted AlecaFrame JSON string into structured profile inventory.
 */
export function parseAlecaJson(jsonString: string): { payload: AlecaProfilePayload; inventory: AlecaInventory } {
  let raw: any;
  try {
    raw = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON in decrypted AlecaFrame data: ${err instanceof Error ? err.message : String(err)}`);
  }

  let inventory: AlecaInventory = {};

  if (raw && typeof raw === 'object') {
    if (typeof raw.InventoryJson === 'string') {
      try {
        inventory = JSON.parse(raw.InventoryJson);
      } catch {
        inventory = {};
      }
    } else if (raw.InventoryJson && typeof raw.InventoryJson === 'object') {
      inventory = raw.InventoryJson;
    } else if (raw.Suits || raw.LongGuns || raw.Recipes || raw.MiscItems) {
      inventory = raw;
    }
  }

  return {
    payload: raw,
    inventory,
  };
}

/**
 * Convenience helper: decrypts and parses AlecaFrame lastData.dat in one step.
 */
export async function decodeAlecaFile(buffer: ArrayBuffer | Uint8Array): Promise<{ payload: AlecaProfilePayload; inventory: AlecaInventory }> {
  const jsonText = await decryptAlecaData(buffer);
  return parseAlecaJson(jsonText);
}

