import { Weapon, Warframe, ModLoadout, DpsResult, EhpResult } from '../types/builds';

export function calculateWeaponDps(weapon: Weapon, mods: ModLoadout): DpsResult {
  let baseDamageMulti = 1;
  let multishotMulti = 1;
  let critChance = weapon.critChance;
  let critMultiplier = weapon.critMultiplier;
  let fireRateMulti = 1;

  for (const slot of mods.slots) {
    if (!slot.mod) continue;
    for (const effect of slot.mod.effects) {
      if (effect.stat === 'damage') {
        baseDamageMulti += effect.value;
      } else if (effect.stat === 'multishot') {
        multishotMulti += effect.value;
      } else if (effect.stat === 'criticalChance') {
        critChance += weapon.critChance * effect.value;
      } else if (effect.stat === 'criticalDamage') {
        critMultiplier += weapon.critMultiplier * effect.value;
      } else if (effect.stat === 'fireRate') {
        fireRateMulti += effect.value;
      }
    }
  }

  const fireRate = weapon.fireRate * fireRateMulti;
  
  // Critical multiplier average: baseDamage * (1 + critChance * (critMultiplier - 1))
  const critAverageMulti = 1 + critChance * (critMultiplier - 1);

  let totalRawDmgPerShot = 0;
  for (const dmg of Object.values(weapon.damage)) {
    if (typeof dmg === 'number') {
      totalRawDmgPerShot += dmg;
    }
  }

  const modifiedDmgPerShot = totalRawDmgPerShot * baseDamageMulti * critAverageMulti;
  
  // Burst DPS includes multishot
  const burstDmgPerShot = modifiedDmgPerShot * multishotMulti;
  const rawDps = modifiedDmgPerShot * fireRate;
  const burstDps = burstDmgPerShot * fireRate;

  // Simplification for sustained
  const magazine = 60; // Assuming typical magazine
  const reloadTime = 2.0; // Assuming typical reload time
  const sustainedDps = burstDps * (magazine / (magazine + reloadTime * fireRate));

  return {
    raw: rawDps,
    burst: burstDps,
    sustained: sustainedDps,
    byDamageType: weapon.damage,
  };
}

export function calculateWarframeEhp(warframe: Warframe, mods: ModLoadout): EhpResult {
  let healthMulti = 1;
  let shieldMulti = 1;
  let armorMulti = 1;

  for (const slot of mods.slots) {
    if (!slot.mod) continue;
    for (const effect of slot.mod.effects) {
      if (effect.stat === 'health') {
        healthMulti += effect.value;
      } else if (effect.stat === 'shield') {
        shieldMulti += effect.value;
      } else if (effect.stat === 'armor') {
        armorMulti += effect.value;
      }
    }
  }

  const health = warframe.health * healthMulti;
  const shield = warframe.shield * shieldMulti;
  const armor = warframe.armor * armorMulti;

  // EHP = health * (1 + armor / 300) + shield
  const effectiveHp = health * (1 + armor / 300) + shield;

  return {
    health,
    shield,
    armor,
    effectiveHp,
  };
}
