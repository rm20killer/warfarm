import { describe, it, expect } from 'vitest';
import { calculateDucatPerPlat, getDucatValue } from '../src/shared/data/ducat-values';
import { RateLimiter } from '../src/shared/utils/rate-limiter';
import { calculateWeaponDps, calculateWarframeEhp } from '../src/shared/data/damage-calc';
import { Weapon, Warframe, ModLoadout } from '../src/shared/types/builds';

describe('Ducat Values & Calculations', () => {
  it('returns correct standard ducat tiers', () => {
    expect(getDucatValue('Common')).toBe(15);
    expect(getDucatValue('Uncommon')).toBe(45);
    expect(getDucatValue('Rare')).toBe(100);
  });

  it('calculates ducat per platinum ratio', () => {
    expect(calculateDucatPerPlat(100, 10)).toBe(10);
    expect(calculateDucatPerPlat(45, 0)).toBe(0);
    expect(calculateDucatPerPlat(15, -5)).toBe(0);
  });
});

describe('Rate Limiter', () => {
  it('acquires tokens within limits', async () => {
    const limiter = new RateLimiter(3, 10);
    const start = Date.now();
    await limiter.acquire();
    await limiter.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});

describe('Damage & EHP Calculation Engine', () => {
  const dummyWeapon: Weapon = {
    uniqueName: '/Lotus/Weapons/Tenno/Rifle',
    name: 'Braton Prime',
    category: 'Primary',
    damage: { Impact: 10, Puncture: 10, Slash: 15 },
    critChance: 0.2,
    critMultiplier: 2.0,
    statusChance: 0.25,
    fireRate: 9.6,
    masteryReq: 8,
    disposition: 1.0,
  };

  const emptyLoadout: ModLoadout = {
    slots: [],
    aura: null,
    exilus: null,
  };

  it('calculates unmodded weapon DPS accurately', () => {
    const dps = calculateWeaponDps(dummyWeapon, emptyLoadout);
    // Base damage per shot = 35
    // Crit multiplier average = 1 + 0.2 * (2.0 - 1) = 1.2
    // Modified damage per shot = 35 * 1.2 = 42
    // Raw DPS = 42 * 9.6 = 403.2
    expect(dps.raw).toBeCloseTo(403.2, 1);
    expect(dps.burst).toBeCloseTo(403.2, 1);
    expect(dps.sustained).toBeLessThan(dps.burst);
  });

  const dummyWarframe: Warframe = {
    uniqueName: '/Lotus/Powersuits/Excalibur',
    name: 'Excalibur',
    health: 300,
    shield: 300,
    armor: 300,
    energy: 150,
    sprintSpeed: 1.0,
    masteryReq: 0,
    abilities: [],
  };

  it('calculates unmodded warframe EHP accurately', () => {
    const ehp = calculateWarframeEhp(dummyWarframe, emptyLoadout);
    // EHP = health * (1 + armor / 300) + shield
    // 300 * (1 + 300/300) + 300 = 300 * 2 + 300 = 900
    expect(ehp.effectiveHp).toBe(900);
    expect(ehp.health).toBe(300);
    expect(ehp.shield).toBe(300);
    expect(ehp.armor).toBe(300);
  });
});

