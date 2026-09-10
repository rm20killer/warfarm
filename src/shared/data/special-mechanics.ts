export interface SpecialChallengeGuide {
  id: string;
  title: string;
  category: 'Lua Principle' | 'Vault System' | 'Special Dimension' | 'Arena';
  rewardItem: string;
  roomVisualCue: string;
  recommendedFrames: string[];
  stepByStepSolution: string[];
  tipsAndTricks?: string[];
}

export const SPECIAL_CHALLENGES: SpecialChallengeGuide[] = [
  // --- LUA PRINCIPLES (HALLS OF ASCENSION) ---
  {
    id: 'hall_power',
    title: 'Lua Power Principle (Power Drift)',
    category: 'Lua Principle',
    rewardItem: 'Power Drift',
    roomVisualCue: 'A multi-tier circular chamber with a large central pit and four tall cylindrical Orokin capacitors that glow with golden energy lines.',
    recommendedFrames: ['Any Frame with high energy pool (Primed Flow) or Energy Pizzas / Squad Restores'],
    stepByStepSolution: [
      'Locate the four cylindrical void battery capacitors embedded around the perimeter of the room.',
      'Stand directly next to each capacitor. The pillar will begin siphoning energy from your Warframe (approximately 40 energy per pillar).',
      'Once fully energized, each pillar glows a solid bright yellow and locks into position.',
      'If you run out of energy, drop an energy restore pad or use Operator energizing abilities.',
      'After all four capacitors are completely powered, a staircase descends into the floor, opening the entrance to the portal room.',
      'Drop down into the portal to collect Power Drift and claim your completion banner.',
    ],
    tipsAndTricks: [
      'Bring squad energy pads so you do not run dry halfway through charging.',
      'Specters or Operator can also be used if your Warframe has low base energy.',
    ],
  },
  {
    id: 'hall_agility',
    title: 'Lua Agility Principle (Agility Drift)',
    category: 'Lua Principle',
    rewardItem: 'Agility Drift',
    roomVisualCue: 'A massive tall hall featuring giant organ pipes with vertical air vent gusts and circular shooting targets above the doors.',
    recommendedFrames: ['Titania (Razorwing lets you bypass puzzle by flying directly)', 'Zephyr', 'Wukong (Cloud Walker)'],
    stepByStepSolution: [
      'Shoot the button above the main entrance to activate the organ pipes and begin the challenge.',
      'Jump into the illuminated open pipe; the updraft will launch your frame high into the air.',
      'Look for the green glowing wall target on the opposite side of the chamber and shoot it while airborne.',
      'Shooting the target opens another pipe lid. Immediately dive into the next pipe before the timer expires.',
      'Repeat this sequence through the organ pipe chain until all targets are activated.',
      'A portal opens at the very top of the organ console; step through to pick up Agility Drift.',
    ],
    tipsAndTricks: [
      'Titania bypass: Activate Razorwing (Ability 4) and simply fly up to each target and shoot it effortlessly.',
      'Ignis or Arca Plasmor makes hitting the flying targets trivial due to wide spread.',
    ],
  },
  {
    id: 'hall_stealth',
    title: 'Lua Stealth Principle (Stealth Drift)',
    category: 'Lua Principle',
    rewardItem: 'Stealth Drift',
    roomVisualCue: 'A long corridor with glowing blue laser walls, moving laser sensor grids, and mechanical shutter doors.',
    recommendedFrames: ['Limbo (Rift Walk is immune to lasers)', 'Ivara (with Infiltrate augment)', 'Operator Void Mode'],
    stepByStepSolution: [
      'Step on the glowing pressure plate at the start of the hallway to lower the entrance barrier and start the timer.',
      'Navigate through the sequence of laser beams without touching any laser tripwire.',
      'If a laser beam touches your frame, the blast doors at the far end will slam shut, resetting the puzzle.',
      'Duck behind stone pillars to let moving horizontal lasers pass over your head.',
      'Reach the end plate before the countdown expires to permanently lock open the portal vault.',
      'Collect Stealth Drift from the Orokin pedestal.',
    ],
    tipsAndTricks: [
      'Limbo can dodge into the Rift and sprint straight through all laser barriers without setting off the alarm.',
      'Operator Void Mode (Crouch) allows invisible, invulnerable movement through the lasers.',
    ],
  },
  {
    id: 'hall_speed',
    title: 'Lua Speed Principle (Speed Drift)',
    category: 'Lua Principle',
    rewardItem: 'Speed Drift',
    roomVisualCue: 'A long obstacle sprint corridor blocked by multiple heavy stone blast doors with Orokin plates and freezing cold floor vents.',
    recommendedFrames: ['Volt (Speed)', 'Gauss (Mach Rush)', 'Titania (Razorwing)', 'Wukong (Cloud Walker)'],
    stepByStepSolution: [
      'Step on the central activation plate and shoot the glowing gold switch located high above the entry door.',
      'The first stone door retracts. Immediately sprint, roll, or bullet jump through the corridor.',
      'Avoid or jump over the freezing cold floor patches that slow your sprint speed.',
      'Shoot the secondary targets embedded in the walls along the way to open intermediate blast doors.',
      'Slide underneath the descending final heavy shutter before it seals shut.',
      'Step into the portal room at the end of the sprint track to claim Speed Drift.',
    ],
    tipsAndTricks: [
      'Use a hitscan weapon or shotgun to trigger wall targets instantly while sliding at maximum velocity.',
      'Wukong Cloud Walker completely ignores floor cold hazards and flies straight through the doors.',
    ],
  },
  {
    id: 'hall_endurance',
    title: 'Lua Endurance Principle (Endurance Drift)',
    category: 'Lua Principle',
    rewardItem: 'Endurance Drift',
    roomVisualCue: 'A deep circular chamber with an elevated central pedestal surrounded by defensive laser turrets that aim directly at the center.',
    recommendedFrames: ['Valkyr (Hysteria invulnerability)', 'Revenant (Mesmer Skin)', 'Inaros / Nidus', 'Operator Void Mode'],
    stepByStepSolution: [
      'Step onto the central platform button in the middle of the pit. The room will seal and overhead laser batteries will activate.',
      'Stay firmly on the central plate while taking concentrated laser fire.',
      'A water tube column on the wall will steadily fill with fluid over roughly 2 minutes.',
      'You cannot leave the platform; stepping off will reset the filling process.',
      'Once the tube fills to 100%, the lasers shut down and a trapdoor opens directly beneath your feet.',
      'Descend into the lower vault room to collect Endurance Drift.',
    ],
    tipsAndTricks: [
      'Operator Void Mode trick: Stand on the button, press 5 for Transference, and hold Crouch to stay in Void Mode invulnerability while the timer runs out.',
      'Revenant Mesmer Skin completely negates all damage instances and laser knockdowns.',
    ],
  },
  {
    id: 'hall_cunning',
    title: 'Lua Cunning Principle (Cunning Drift)',
    category: 'Lua Principle',
    rewardItem: 'Cunning Drift',
    roomVisualCue: 'A massive circular arena with a dormant Orokin Security Eye apparatus suspended in the ceiling and 4 destructible pillars.',
    recommendedFrames: ['Any durable frame with good mobility (Nezha, Rhino, Zephyr)'],
    stepByStepSolution: [
      'Shoot the water tubes or step on the floor triggers around the arena to awaken the Orokin Security Eye boss.',
      'The Security Eye will open and target you with a high-damage charging laser beam.',
      'Position yourself directly in front of one of the four stone pillars around the arena perimeter.',
      'Wait for the Eye to telegraph its shot, then bullet jump out of the way at the last moment so the beam strikes the pillar.',
      'The explosive beam will shatter the pillar. Repeat this bait maneuver for all four stone pillars.',
      'Once all four pillars are destroyed, the Security Eye crashes into the floor and self-destructs, revealing the vault portal.',
      'Step inside to retrieve Cunning Drift.',
    ],
    tipsAndTricks: [
      'Do not shoot the eye directly; your weapons deal no damage to it. Only baiting its laser can destroy the pillars.',
    ],
  },
  {
    id: 'hall_coaction',
    title: 'Lua Coaction Principle (Coaction Drift)',
    category: 'Lua Principle',
    rewardItem: 'Coaction Drift',
    roomVisualCue: 'A multi-level room containing four glowing circular pressure plates that need to be depressed at the exact same time.',
    recommendedFrames: ['Any Frame (Equip Warframe Specters or On-Call Crew in gear wheel for solo runs)'],
    stepByStepSolution: [
      'Identify the four pressure plates: two on the upper platform and two on the lower tier.',
      'In a 4-player squad: Have each player stand on one plate simultaneously to unlock the central chamber.',
      'Solo Solution:',
      '1. Place a Warframe Specter on Plate 1 and command it to "Hold Position".',
      '2. Place an On-Call Crewmate or Clem Clone on Plate 2.',
      '3. Leave your Warframe standing on Plate 3.',
      '4. Use Transference (Ability 5) to project your Operator onto Plate 4.',
      'With all four plates weighted, the floor gate slides back, granting access to Coaction Drift.',
    ],
    tipsAndTricks: [
      'Any deployable gear item with physical weight (Specter, Ancient Healer, Clem clone) counts as a body on the plate.',
    ],
  },

  // --- OROKIN DERELICT VAULTS ---
  {
    id: 'orokin_vault',
    title: 'Orokin Derelict Vaults (Corrupted Mods)',
    category: 'Vault System',
    rewardItem: 'Corrupted Mods (Blind Rage, Fleeting Expertise, Narrow Minded, Overextended, etc.)',
    roomVisualCue: 'A heavily ornate stone Orokin door with a central glowing keyhole, surrounded by Infested flesh growths on Deimos tilesets.',
    recommendedFrames: ['Titania (Razorwing ignores Hobbled movement penalty)', 'Wukong', 'Inaros / Rhino (survives Bleeding penalty)'],
    stepByStepSolution: [
      'Purchase the 4 Dragon Key blueprints from your Clan Dojo Orokin Lab: Bleeding, Decaying, Extinguished, and Hobbled.',
      'Craft all four keys in your Foundry and equip ALL FOUR keys in your Gear Wheel (solo players can carry all four simultaneously).',
      'Select a fast Deimos mission (Horend - Capture is the fastest community farming node).',
      'Complete the mission objective (capture the target) quickly.',
      'Explore the branching side-rooms and conduits to locate the glowing Orokin Vault door.',
      'Interact with the door. The matching Dragon Key will be consumed automatically from your gear wheel.',
      'Collect the glowing Orokin Artifact from the pedestal. The Lotus will warn of corrupted reinforcements.',
      'Extract to reveal your unidentified Corrupted Mod on the End of Match screen.',
    ],
    tipsAndTricks: [
      'Titania in Razorwing form flies at standard speed, entirely bypassing the 50% movement reduction from the Hobbled Dragon Key.',
      'Equip Loot Radar / Animal Instinct on your companion to easily spot side rooms and the vault chamber.',
    ],
  },

  // --- GRANUM VOID ---
  {
    id: 'granum_void',
    title: 'Granum Void (Protea & Corpus Weapons)',
    category: 'Special Dimension',
    rewardItem: 'Protea Parts, Stropha, Stahlta, Velox',
    roomVisualCue: 'A massive golden hand statue (Golden Hand Tribute) found on the remastered Corpus Ship tileset.',
    recommendedFrames: ['Mesa (Peacemaker wipes Errant Specters instantly)', 'Revenant (Danse Macabre)', 'Octavia'],
    stepByStepSolution: [
      'Acquire Granum Crowns by killing the Corpus Treasurer who spawns 2-5 minutes into any Corpus Ship mission.',
      'Three tiers: Standard Granum Crown (level 0-15), Exemplar Crown (level 15-30), Zenith Crown (level 30+).',
      'Locate the Golden Hand Tribute statue in the mission and deposit the appropriate Crown.',
      'You are transported into the Granum Void dimension with a 60-second timer.',
      'Equip the Xoris glaive. Kill Errant Specters and absorb 3 Specter particles to charge the Xoris.',
      'Use heavy attack / alt-fire to detonate the charged Xoris, instantly freeing trapped Solaris captives for bonus time.',
      'Reach Tier 3 reward threshold (75 kills solo, 100 kills with squad) before the timer runs out.',
      'Extract from the mission to receive your weapon and Warframe components.',
    ],
    tipsAndTricks: [
      'The Xoris glaive received during The Deadlock Protocol quest has infinite combo duration, making captive detonations effortless.',
    ],
  },
];

export function getSpecialChallenge(id: string): SpecialChallengeGuide | undefined {
  return SPECIAL_CHALLENGES.find((c) => c.id === id);
}

export function searchSpecialChallenges(query: string): SpecialChallengeGuide[] {
  const q = query.toLowerCase().trim();
  if (!q) return SPECIAL_CHALLENGES;

  return SPECIAL_CHALLENGES.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.rewardItem.toLowerCase().includes(q) ||
      c.roomVisualCue.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
  );
}

