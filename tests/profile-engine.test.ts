import { describe, it, expect } from 'vitest';
import {
  calculateMasteryRankFromPoints,
  analyzePlayerProfile,
} from '../src/shared/data/profile-engine';
import { AlecaInventory } from '../src/shared/utils/aleca-decoder';

describe('Profile Engine', () => {
  describe('calculateMasteryRankFromPoints', () => {
    it('should calculate MR 0 for 0 points', () => {
      const res = calculateMasteryRankFromPoints(0);
      expect(res.rank).toBe(0);
      expect(res.currentRankMinPoints).toBe(0);
      expect(res.nextRankPoints).toBe(2500);
      expect(res.progressPercent).toBe(0);
    });

    it('should calculate MR 10 correctly', () => {
      const res = calculateMasteryRankFromPoints(276250);
      expect(res.rank).toBe(10);
      expect(res.currentRankMinPoints).toBe(250000);
      expect(res.nextRankPoints).toBe(302500);
      expect(res.progressPercent).toBe(50);
    });
  });

  describe('analyzePlayerProfile', () => {
    it('should process inventory and categorize equipment mastery and crafting readiness', () => {
      const mockInventory: AlecaInventory = {
        PlayerLevel: 14,
        RegularCredits: 2500000,
        PremiumCreditsFree: 350,
        FusionPoints: 12000,
        PrimeTokens: 450,
        TradesRemaining: 14,
        Suits: [
          {
            ItemType: '/Lotus/Powersuits/Rhino/Rhino',
            XP: 180000,
            Polarized: 2,
          },
          {
            ItemType: '/Lotus/Powersuits/Excalibur/Excalibur',
            XP: 60000,
            Polarized: 0,
          },
        ],
        LongGuns: [
          {
            ItemType: '/Lotus/Weapons/Tenno/Rifle/Braton',
            XP: 90000,
            Polarized: 1,
          },
        ],
        Recipes: [
          {
            ItemType: '/Lotus/Types/Recipes/Weapons/BratonPrimeRecipe',
            ItemCount: 1,
          },
        ],
        MiscItems: [
          {
            ItemType: '/Lotus/Types/Items/MiscItems/Rubedo',
            ItemCount: 50000,
          },
          {
            ItemType: '/Lotus/Types/Items/MiscItems/ControlModule',
            ItemCount: 100,
          },
        ],
        XPInfo: [
          {
            ItemType: '/Lotus/Powersuits/Rhino/Rhino',
            XP: 180000,
          },
          {
            ItemType: '/Lotus/Weapons/Tenno/Rifle/Braton',
            XP: 90000,
          },
        ],
      };

      const analysis = analyzePlayerProfile(mockInventory, 'ExcaliburMaster');

      // Check Summary
      expect(analysis.summary.playerName).toBe('ExcaliburMaster');
      expect(analysis.summary.masteryRank).toBe(14);
      expect(analysis.summary.credits).toBe(2500000);
      expect(analysis.summary.platinum).toBe(350);
      expect(analysis.summary.endo).toBe(12000);
      expect(analysis.summary.ducats).toBe(450);

      // Check Equipment Analysis
      const rhino = analysis.equipment.find((e) => e.name.toLowerCase().includes('rhino'));
      expect(rhino).toBeDefined();
      expect(rhino?.status).toBe('mastered');
      expect(rhino?.formaCount).toBe(2);

      const braton = analysis.equipment.find((e) => e.name === 'Braton');
      expect(braton).toBeDefined();
      expect(braton?.status).toBe('mastered');

      // Check Category Stats
      expect(analysis.summary.categoryStats.Warframes.totalItems).toBeGreaterThan(50);
      expect(analysis.summary.categoryStats.Warframes.mastered).toBeGreaterThanOrEqual(1);

      // Check Crafting Assistant
      expect(analysis.craftingAssistant.length).toBeGreaterThan(0);

      // Check Recommendations
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });
});

