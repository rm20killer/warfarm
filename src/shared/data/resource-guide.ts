export type ResourceCategory = 'Rare' | 'Uncommon' | 'Common' | 'OpenWorld' | 'Special';

export interface OptimalFarmNode {
  node: string;
  planet: string;
  missionType: string;
  faction: 'Grineer' | 'Corpus' | 'Infested' | 'Corrupted' | 'Sentient' | 'Neutral';
  efficiencyRating: 'Best' | 'Great' | 'Alternative';
  strategyNote: string;
}

export interface ResourceFarmingGuide {
  id: string;
  name: string;
  category: ResourceCategory;
  planets: string[];
  description: string;
  specialMechanics?: string;
  acquisition?: string;
  recommendedFrames: string[];
  optimalNodes: OptimalFarmNode[];
  tradable?: boolean;
}

export const RESOURCE_GUIDES: ResourceFarmingGuide[] = [
  {
    id: 'argon_crystal',
    name: 'Argon Crystal',
    category: 'Rare',
    planets: ['Void'],
    description: 'A radioactive isotope found only in the Orokin Void. Decays over real time.',
    specialMechanics: 'Decay Timer: Argon crystals have a 24-hour decay half-life at UTC 00:00. Farm only when actively building items.',
    recommendedFrames: ['Nekros (Desecrate)', 'Khora (Pilfering Strangledome)', 'Xaku (Box-breaker)'],
    optimalNodes: [
      {
        node: 'Mot',
        planet: 'Void',
        missionType: 'Survival',
        faction: 'Corrupted',
        efficiencyRating: 'Best',
        strategyNote: 'High spawn density; combine loot abilities in a squad for rapid drop yields.',
      },
      {
        node: 'Hepit',
        planet: 'Void',
        missionType: 'Capture',
        faction: 'Corrupted',
        efficiencyRating: 'Great',
        strategyNote: 'Fast 1-minute runs; break all containers with high-range Limbo or Xaku along the objective path.',
      },
      {
        node: 'Ani',
        planet: 'Void',
        missionType: 'Survival',
        faction: 'Corrupted',
        efficiencyRating: 'Alternative',
        strategyNote: 'Lower enemy level than Mot for solo or leveling frames while collecting Argon.',
      },
    ],
  },
  {
    id: 'orokin_cell',
    name: 'Orokin Cell',
    category: 'Rare',
    planets: ['Saturn', 'Ceres', 'Deimos'],
    description: 'Crucial component for Prime weapons, Warframes, and Forma foundry blueprints.',
    recommendedFrames: ['Nekros', 'Khora', 'Speed Nova'],
    optimalNodes: [
      {
        node: 'Piscinas',
        planet: 'Saturn',
        missionType: 'Survival (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Dark Sector resource drop boost (+20%) combined with infinite melee Infested swarms.',
      },
      {
        node: 'Seimeni',
        planet: 'Ceres',
        missionType: 'Defense (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Great',
        strategyNote: '5-wave quick extract grants extra credits plus Cell drop chances from general spawns.',
      },
      {
        node: 'Tethys',
        planet: 'Saturn',
        missionType: 'Assassination (General Sargas Ruk)',
        faction: 'Grineer',
        efficiencyRating: 'Alternative',
        strategyNote: 'Boss guarantees high probability Orokin Cell drop on death with speedrun builds.',
      },
    ],
  },
  {
    id: 'tellurium',
    name: 'Tellurium',
    category: 'Rare',
    planets: ['Uranus', 'Kuva Fortress', 'Archwing Missions'],
    description: 'Rare submersible mineral found in Archwing and Uranus Grineer Sealab environments.',
    recommendedFrames: ['Khora', 'Nekros', 'Hydroid'],
    optimalNodes: [
      {
        node: 'Ophelia',
        planet: 'Uranus',
        missionType: 'Survival',
        faction: 'Grineer',
        efficiencyRating: 'Best',
        strategyNote: 'Grineer Sealab tileset; enemies qualify for submersible drop tables. Camp a dead-end room.',
      },
      {
        node: 'Salacia',
        planet: 'Neptune',
        missionType: 'Mobile Defense (Archwing)',
        faction: 'Corpus',
        efficiencyRating: 'Great',
        strategyNote: 'High enemy volumes in space combat; excellent for leveling Archwing while accumulating Tellurium.',
      },
    ],
  },
  {
    id: 'plastids',
    name: 'Plastids',
    category: 'Uncommon',
    planets: ['Saturn', 'Uranus', 'Phobos', 'Pluto', 'Eris'],
    description: 'Biotic tissue mass used extensively in warframe chassis and weapon synthesis.',
    recommendedFrames: ['Nekros', 'Khora', 'Speed Nova'],
    optimalNodes: [
      {
        node: 'Piscinas',
        planet: 'Saturn',
        missionType: 'Survival (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Double duty: high Plastid drop volume alongside Orokin Cells.',
      },
      {
        node: 'Zabala',
        planet: 'Eris',
        missionType: 'Survival (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Great',
        strategyNote: 'Highest base Dark Sector resource drop bonus (+30%) on the Star Chart.',
      },
      {
        node: 'Stickney',
        planet: 'Phobos',
        missionType: 'Survival',
        faction: 'Corpus',
        efficiencyRating: 'Alternative',
        strategyNote: 'Accessible for early-game players before unlocking Saturn.',
      },
    ],
  },
  {
    id: 'polymer_bundle',
    name: 'Polymer Bundle',
    category: 'Common',
    planets: ['Mercury', 'Venus', 'Uranus'],
    description: 'Synthetic polymers required in massive amounts for squad energy restores.',
    recommendedFrames: ['Khora', 'Nekros', 'Speed Nova'],
    optimalNodes: [
      {
        node: 'Ophelia',
        planet: 'Uranus',
        missionType: 'Survival',
        faction: 'Grineer',
        efficiencyRating: 'Best',
        strategyNote: 'Primary community spot: provides simultaneous Tellurium, Polymer Bundles, and Condition Overload.',
      },
      {
        node: 'Assur',
        planet: 'Uranus',
        missionType: 'Survival (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Great',
        strategyNote: 'Dark Sector variant for players who prefer Infested hordes over Grineer ranged units.',
      },
    ],
  },
  {
    id: 'neural_sensors',
    name: 'Neural Sensors',
    category: 'Rare',
    planets: ['Jupiter', 'Kuva Fortress'],
    description: 'Grineer biotechnology node used in warframe neuroptics and helm production.',
    recommendedFrames: ['Nekros', 'Khora'],
    optimalNodes: [
      {
        node: 'Cameria',
        planet: 'Jupiter',
        missionType: 'Survival (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Infested Dark Sector with high density and +20% resource drop booster.',
      },
      {
        node: 'Themisto',
        planet: 'Jupiter',
        missionType: 'Assassination (Alad V)',
        faction: 'Corpus',
        efficiencyRating: 'Great',
        strategyNote: 'Alad V & Zanuka can be eliminated in under 90 seconds for quick sensor drops.',
      },
    ],
  },
  {
    id: 'neurodes',
    name: 'Neurodes',
    category: 'Rare',
    planets: ['Earth', 'Luas', 'Eris', 'Deimos'],
    description: 'Bio-mechanical sensory clusters used extensively in early and mid-game crafting.',
    recommendedFrames: ['Nekros', 'Khora', 'Xaku'],
    optimalNodes: [
      {
        node: 'Tikal',
        planet: 'Earth',
        missionType: 'Excavation (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Infested Excavation allows fast enemy grouping; destroy Neurode arrays on the surface.',
      },
      {
        node: 'Tycho',
        planet: 'Lua',
        missionType: 'Survival',
        faction: 'Corrupted',
        efficiencyRating: 'Great',
        strategyNote: 'Sentient Battalysts and Conculysts spawn periodically with elevated Neurode drop rates.',
      },
    ],
  },
  {
    id: 'mutagen_sample',
    name: 'Mutagen Sample',
    category: 'Uncommon',
    planets: ['Eris', 'Deimos'],
    description: 'Infested biological compound infamous for the Hema clan research requirement.',
    recommendedFrames: ['Nekros', 'Khora', 'Speed Nova', 'Wisp'],
    optimalNodes: [
      {
        node: 'Terrorek',
        planet: 'Deimos',
        missionType: 'Survival',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Deimos has significantly higher Mutagen Sample drop rates than Eris. Form a full farm squad.',
      },
    ],
  },
  {
    id: 'oxium',
    name: 'Oxium',
    category: 'Uncommon',
    planets: ['Jupiter', 'Neptune', 'Pluto', 'Europa'],
    description: 'Lighter-than-air alloy dropped exclusively by Corpus Oxium Ospreys.',
    specialMechanics: 'Important: You must kill Oxium Ospreys before they self-destruct to receive the Oxium drop.',
    recommendedFrames: ['Khora (Ensnare/Strangledome freezes ospreys)', 'Nekros'],
    optimalNodes: [
      {
        node: 'Io',
        planet: 'Jupiter',
        missionType: 'Defense',
        faction: 'Corpus',
        efficiencyRating: 'Best',
        strategyNote: 'High Oxium Osprey spawn rates in waves 1-10; cc ospreys immediately so they do not suicide.',
      },
    ],
  },
  {
    id: 'cryotic',
    name: 'Cryotic',
    category: 'Common',
    planets: ['All Planets (Excavation missions)'],
    description: 'Sub-zero mineral extracted from deep planetary crusts.',
    specialMechanics: 'Yield: Exactly 100 Cryotic per fully completed extractor (200 with resource booster).',
    recommendedFrames: ['Frost (Snow Globe)', 'Gara (Mass Vitrify)', 'Khora (Strangledome)'],
    optimalNodes: [
      {
        node: 'Hieracon',
        planet: 'Pluto',
        missionType: 'Excavation (Dark Sector)',
        faction: 'Infested',
        efficiencyRating: 'Best',
        strategyNote: 'Infested Excavation offers continuous Cryotic plus high tier Neo/Axi relics and credits.',
      },
      {
        node: 'Kiliken',
        planet: 'Venus',
        missionType: 'Excavation',
        faction: 'Corpus',
        efficiencyRating: 'Alternative',
        strategyNote: 'Low enemy level for beginner solo players to stockpile starting Cryotic.',
      },
    ],
  },
  {
    id: 'toroid',
    name: 'Toroids (Vega / Calda / Sola)',
    category: 'OpenWorld',
    planets: ['Orb Vallis (Venus)'],
    description: 'Ancient Orokin tech devices used for Vox Solaris standing and Garuda components.',
    specialMechanics: 'Raise alert level to 4 beacons at specific facilities to maximize enemy spawn rates.',
    recommendedFrames: ['Khora', 'Nekros', 'Wisp'],
    optimalNodes: [
        {
          node: 'Spaceport (Vega) / Enrichment Labs (Calda) / Temple of Profit (Sola)',
          planet: 'Orb Vallis',
          missionType: 'Open World Compound Defense',
          faction: 'Corpus',
          efficiencyRating: 'Best',
          strategyNote: 'Keep reinforcement beacons alive to maintain max level 4 threat; camp internal lab doors.',
        },
      ],
    },
    {
      id: 'salvage',
      name: 'Salvage',
      category: 'Common',
      planets: ['Mars', 'Jupiter', 'Sedna'],
      description: 'High value metals collected from war salvage. Fundamental component in weapon and Warframe fabrication.',
      specialMechanics: 'Dark Sector missions on Mars give +30% Resource Drop Rate. High enemy density facilitates rapid farming.',
      recommendedFrames: ['Nekros', 'Khora', 'Hydroid', 'Nova'],
      optimalNodes: [
        {
          node: 'Wahiba',
          planet: 'Mars',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+30% Resource Drop Rate Dark Sector bonus. Combine Pilfering Strangledome and Desecrate in a choke point for 15,000+ Salvage in 15 minutes.',
        },
        {
          node: 'Camis',
          planet: 'Jupiter',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Great',
          strategyNote: '+20% Resource Drop Rate. Good secondary source alongside Neural Sensors and Hexenon.',
        },
        {
          node: 'Amarna',
          planet: 'Sedna',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Alternative',
          strategyNote: '+20% Resource Drop Rate Dark Sector node for high level squads.',
        },
      ],
    },
    {
      id: 'ferrite',
      name: 'Ferrite',
      category: 'Common',
      planets: ['Mercury', 'Earth', 'Lua', 'Void'],
      description: 'A common metallic substance used extensively in almost all basic foundry blueprints.',
      recommendedFrames: ['Nekros', 'Khora', 'Xaku'],
      optimalNodes: [
        {
          node: 'Apollodorus',
          planet: 'Mercury',
          missionType: 'Survival',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'High enemy spawn rates accessible from early game. Very fast Ferrite accumulation.',
        },
        {
          node: 'Taranis',
          planet: 'Void',
          missionType: 'Defense',
          faction: 'Corrupted',
          efficiencyRating: 'Great',
          strategyNote: 'Combine Ferrite farming with relic openings and Argon Crystal drops.',
        },
        {
          node: 'Mariana',
          planet: 'Earth',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Alternative',
          strategyNote: 'Fast container clearing route for solo starters.',
        },
      ],
    },
    {
      id: 'alloy_plate',
      name: 'Alloy Plate',
      category: 'Common',
      planets: ['Venus', 'Jupiter', 'Sedna', 'Ceres', 'Phobos', 'Pluto'],
      description: 'Rolled carbon-steel plating used in structural armor and heavy foundry recipes.',
      recommendedFrames: ['Nekros', 'Khora', 'Nova'],
      optimalNodes: [
        {
          node: 'Gabii',
          planet: 'Ceres',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+35% Resource Drop Rate Dark Sector bonus. Outstanding yield per minute with Orokin Cell drop chances.',
        },
        {
          node: 'Malva',
          planet: 'Venus',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Great',
          strategyNote: '+20% Resource Drop Rate accessible immediately on Venus.',
        },
        {
          node: 'Palus',
          planet: 'Pluto',
          missionType: 'Survival',
          faction: 'Corpus',
          efficiencyRating: 'Alternative',
          strategyNote: 'High level node combining Alloy Plate and Credits.',
        },
      ],
    },
    {
      id: 'circuits',
      name: 'Circuits',
      category: 'Uncommon',
      planets: ['Venus', 'Ceres', 'Kuva Fortress'],
      description: 'Electronic logic components needed for Warframe systems, helmets, and robotic foundry builds.',
      recommendedFrames: ['Nekros', 'Khora', 'Hydroid'],
      optimalNodes: [
        {
          node: 'Malva',
          planet: 'Venus',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+20% Resource Drop Rate Dark Sector node with heavy Infested spawns.',
        },
        {
          node: 'Gabii',
          planet: 'Ceres',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Great',
          strategyNote: '+35% Resource Drop Rate Dark Sector node. Drops both Circuits and Alloy Plate in huge quantities.',
        },
        {
          node: 'Taveuni',
          planet: 'Kuva Fortress',
          missionType: 'Survival',
          faction: 'Grineer',
          efficiencyRating: 'Alternative',
          strategyNote: 'Farm Circuits concurrently with Kuva and high level relics.',
        },
      ],
    },
    {
      id: 'rubedo',
      name: 'Rubedo',
      category: 'Uncommon',
      planets: ['Earth', 'Phobos', 'Europa', 'Sedna', 'Void'],
      description: 'A crystalline mineral with piezoelectric properties used in weapon and chassis framing.',
      recommendedFrames: ['Nekros', 'Khora', 'Limbo'],
      optimalNodes: [
        {
          node: 'Zeugma',
          planet: 'Phobos',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+20% Resource Drop Rate Dark Sector bonus. Very consistent Rubedo yields.',
        },
        {
          node: 'Mot',
          planet: 'Void',
          missionType: 'Survival',
          faction: 'Corrupted',
          efficiencyRating: 'Great',
          strategyNote: 'Farm Rubedo while gathering Argon Crystals and Axi Relics.',
        },
        {
          node: 'Larzac',
          planet: 'Europa',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Alternative',
          strategyNote: '+20% Resource Drop Rate node on Europa.',
        },
      ],
    },
    {
      id: 'nano_spores',
      name: 'Nano Spores',
      category: 'Common',
      planets: ['Saturn', 'Neptune', 'Eris', 'Deimos'],
      description: 'Fibrous technocyte tumor tissue harvested from Infested environments.',
      recommendedFrames: ['Nekros', 'Khora', 'Nova'],
      optimalNodes: [
        {
          node: 'Piscinas',
          planet: 'Saturn',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+20% Resource Drop Rate Dark Sector node. Drops massive Nano Spores alongside Orokin Cells.',
        },
        {
          node: 'Zabala',
          planet: 'Eris',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Great',
          strategyNote: '+30% Resource Drop Rate Dark Sector bonus on Eris.',
        },
        {
          node: 'Magnacid',
          planet: 'Deimos',
          missionType: 'Survival',
          faction: 'Infested',
          efficiencyRating: 'Alternative',
          strategyNote: 'Farm Nano Spores concurrently with Cambion Drift materials.',
        },
      ],
    },
    {
      id: 'morphics',
      name: 'Morphics',
      category: 'Rare',
      planets: ['Mercury', 'Mars', 'Phobos', 'Europa', 'Pluto'],
      description: 'An amorphous solid of mysterious Orokin origin required for weapons and chassis.',
      recommendedFrames: ['Nekros', 'Khora', 'Xaku'],
      optimalNodes: [
        {
          node: 'Wahiba',
          planet: 'Mars',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Best',
          strategyNote: '+30% Resource Drop Rate. Infested density yields frequent Morphic drops from enemies and lockers.',
        },
        {
          node: 'Tolstoj',
          planet: 'Mercury',
          missionType: 'Assassination',
          faction: 'Grineer',
          efficiencyRating: 'Great',
          strategyNote: 'Captain Vor assassination has high drop chance for Morphics; 1-2 minute speedruns.',
        },
        {
          node: 'Memphis',
          planet: 'Phobos',
          missionType: 'Defection (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Alternative',
          strategyNote: 'High container and mob drop rates.',
        },
      ],
    },
    {
      id: 'gallium',
      name: 'Gallium',
      category: 'Rare',
      planets: ['Mars', 'Uranus'],
      description: 'A soft metallic element essential for energy weapons, lasers, and Warframe components.',
      recommendedFrames: ['Nekros', 'Khora', 'Hydroid'],
      optimalNodes: [
        {
          node: 'Ophelia',
          planet: 'Uranus',
          missionType: 'Survival',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Best combined farming node: yields Gallium, Tellurium, and Polymer Bundles concurrently.',
        },
        {
          node: 'Wahiba',
          planet: 'Mars',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Great',
          strategyNote: '+30% Resource Drop Rate bonus makes enemy Gallium drops common.',
        },
        {
          node: 'Titania',
          planet: 'Uranus',
          missionType: 'Assassination',
          faction: 'Grineer',
          efficiencyRating: 'Alternative',
          strategyNote: 'Tyl Regor boss fight drops Gallium with high frequency.',
        },
      ],
    },
    {
      id: 'control_module',
      name: 'Control Module',
      category: 'Rare',
      planets: ['Neptune', 'Europa', 'Void'],
      description: 'Autonomous robotics processor unit used in robotics, Warframe systems, and advanced foundry items.',
      recommendedFrames: ['Nekros', 'Xaku', 'Volt'],
      optimalNodes: [
        {
          node: 'Hepit',
          planet: 'Void',
          missionType: 'Capture',
          faction: 'Corrupted',
          efficiencyRating: 'Best',
          strategyNote: 'Fast 45-second runs. Break green containers along the way for 1-5 Control Modules per run.',
        },
        {
          node: 'Mot',
          planet: 'Void',
          missionType: 'Survival',
          faction: 'Corrupted',
          efficiencyRating: 'Great',
          strategyNote: 'Enemies in the Void drop Control Modules at a very high rate compared to normal rare resources.',
        },
        {
          node: 'Kelashin',
          planet: 'Neptune',
          missionType: 'Survival (Dark Sector)',
          faction: 'Infested',
          efficiencyRating: 'Alternative',
          strategyNote: '+20% Resource Drop Rate Dark Sector node.',
        },
      ],
    },
    {
      id: 'kuva',
      name: 'Kuva',
      category: 'Special',
      planets: ['Kuva Fortress'],
      description: 'A crimson Orokin elixir required for Riven mod cycling and specialized weapon crafting.',
      specialMechanics: 'Collect Kuva Life Support Harvesters during Kuva Survival (Taveuni) or capture Kuva clouds with Operator Void Blast during Siphon/Flood missions.',
      recommendedFrames: ['Khora', 'Frost', 'Limbo', 'Wisp'],
      optimalNodes: [
        {
          node: 'Taveuni',
          planet: 'Kuva Fortress',
          missionType: 'Survival',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Endless Kuva Survival. Transform life support towers into Kuva Harvesters for 200 Kuva every 90 seconds (boosted by Resource Boosters and Smeeta Kavat).',
        },
      ],
    },
    {
      id: 'voidplume_quill',
      name: 'Voidplume Quill',
      category: 'OpenWorld',
      planets: ['Zariman Ten Zero'],
      description: 'A crystallized feather of Void energy harvested from the Zariman. Essential currency for Holdfasts standing and crafting Incarnon equipment.',
      acquisition: 'Awarded as a guaranteed reward from Zariman Bounties offered by Quinn in the Chrysalith (Tier 3 to 5 bounties grant 2 to 5 Quills). Can also be found by locating hidden Orokin Sound Codes and delivering them to Cephalon Melica terminals for 1 Quill each, or as rare dormant pickups.',
      specialMechanics: 'Melica Consoles and Bounties: Higher tier Zariman Bounties (Tier 3-5) are the fastest, most consistent farm. Bringing Orokin Sound Codes to Melica terminals awards 1 Quill per console.',
      recommendedFrames: ['Xaku (The Vast Untime)', 'Limbo (Cataclysm Crate-Breaker)', 'Titania (Speed Bounty Completer)', 'Volt'],
      optimalNodes: [
        {
          node: 'Zariman Bounties (Quinn)',
          planet: 'Zariman',
          missionType: 'Bounties (Tier 3-5)',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Fastest method for Quills. Complete Tier 3, 4, or 5 bounties (especially Exterminate or Mobile Defense) for 2 to 5 guaranteed Quills upon completion.',
        },
        {
          node: 'Halako Perimeter',
          planet: 'Zariman',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Great',
          strategyNote: 'Fast mission completion while scouring side rooms for Melica sound codes and defeating the guaranteed dormant Void Angel.',
        },
        {
          node: 'Tuvul Commons',
          planet: 'Zariman',
          missionType: 'Survival',
          faction: 'Grineer',
          efficiencyRating: 'Alternative',
          strategyNote: 'Endless Zariman survival with loot radar to search for hidden plumes while farming Voidgel Orbs and Entrati Lanthorns.',
        },
      ],
    },
    {
      id: 'voidplume_pinion',
      name: 'Voidplume Pinion',
      category: 'OpenWorld',
      planets: ['Zariman Ten Zero'],
      description: 'The radiant crest feather of a dormant Void Angel. High-value resource required for Incarnon weapon blueprints, evolutions, and Holdfasts rank advancement.',
      acquisition: 'Guaranteed 1 drop per defeated Ravenous Void Angel in any Zariman mission. Can also be purchased from Archimedean Yonta in the Chrysalith for Voidgel Orbs or Entrati Lanthorns on daily rotating offers.',
      specialMechanics: 'Void Angel Combat: Awakening a dormant Angel initiates a two-phase boss battle. Phase 1 requires physical DPS; Phase 2 takes place within an ethereal Void sphere requiring Operator Void Sling and Amp damage.',
      recommendedFrames: ['Madurai Focus (Void Strike)', 'Wisp (Motes Buff)', 'Rhino (Roar)', 'Mesa (Peacemaker)'],
      optimalNodes: [
        {
          node: 'Halako Perimeter',
          planet: 'Zariman',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Quickly find and awaken the guaranteed dormant Void Angel in the level. Defeat it in under 3 minutes, then finish the exterminate and extract.',
        },
        {
          node: 'The Greenway',
          planet: 'Zariman',
          missionType: 'Mobile Defense',
          faction: 'Grineer',
          efficiencyRating: 'Great',
          strategyNote: 'Locate and defeat the dormant Void Angel while the mobile defense console timer counts down.',
        },
      ],
    },
    {
      id: 'voidplume_crest',
      name: 'Voidplume Crest',
      category: 'OpenWorld',
      planets: ['Zariman Ten Zero'],
      description: 'A delicate Void crystal formation found as a physical pickup in Zariman corridors. Required sacrifice for Holdfasts rank advancement.',
      acquisition: 'Spawns as 1 of the 8 hidden physical pickups scattered throughout each Zariman mission. Typically only 1 Crest spawns per mission, making loot radar and crate-busting essential.',
      specialMechanics: 'Zariman Scavenging: Exactly 8 Voidplumes spawn hidden in each mission (a mix of Downs, Vanes, and 1 Crest). Equip maximum Loot Radar (Animal Instinct, Thief\'s Wit) and use wide-radius container breaking to isolate real pickups.',
      recommendedFrames: ['Xaku (The Vast Untime)', 'Limbo (Max Range Cataclysm)', 'Golden Instinct (Helminth)', 'Orokin Eye (Air Support)'],
      optimalNodes: [
        {
          node: 'Halako Perimeter',
          planet: 'Zariman',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Crate-breaking run. Clear rooms with wide-area box-breaking abilities and check mini-map loot markers that do not break.',
        },
      ],
    },
    {
      id: 'voidplume_vane',
      name: 'Voidplume Vane',
      category: 'OpenWorld',
      planets: ['Zariman Ten Zero'],
      description: 'A fan-shaped Voidplume pickup hidden in Zariman architecture or awarded from lower tier bounties.',
      acquisition: 'Found among the 8 hidden physical pickups scattered across Zariman mission corridors. Also awarded as a stage reward from Tier 2 Zariman Bounties.',
      specialMechanics: 'Scavenge with Loot Radar: Usually 1 to 3 Vanes spawn per Zariman mission alongside common Downs and the single Crest.',
      recommendedFrames: ['Xaku', 'Limbo', 'Orokin Eye (Air Support)'],
      optimalNodes: [
        {
          node: 'Halako Perimeter',
          planet: 'Zariman',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Explore side rooms and vents with loot radar to pick up 1 to 3 Vanes per run.',
        },
        {
          node: 'Chrysalith Tier 2 Bounty',
          planet: 'Zariman',
          missionType: 'Bounties',
          faction: 'Grineer',
          efficiencyRating: 'Great',
          strategyNote: 'Complete Tier 2 Zariman bounties for direct mission reward drops.',
        },
      ],
    },
    {
      id: 'voidplume_down',
      name: 'Voidplume Down',
      category: 'OpenWorld',
      planets: ['Zariman Ten Zero'],
      description: 'The most common physical Voidplume pickup found throughout Zariman missions. Used for Holdfasts standing and crafting.',
      acquisition: 'Found as multiple physical pickups (usually 4 to 5) of the 8 total hidden Voidplumes in every Zariman mission. Also awarded from Tier 1 Zariman Bounties.',
      specialMechanics: 'Common Zariman Pickup: Break storage containers across the map to locate the 4 to 5 Downs present in every Zariman level.',
      recommendedFrames: ['Xaku', 'Limbo', 'Orokin Eye (Air Support)'],
      optimalNodes: [
        {
          node: 'Halako Perimeter',
          planet: 'Zariman',
          missionType: 'Exterminate',
          faction: 'Grineer',
          efficiencyRating: 'Best',
          strategyNote: 'Fast crate-breaking run picking up 4 to 5 Downs per run.',
        },
        {
          node: 'Chrysalith Tier 1 Bounty',
          planet: 'Zariman',
          missionType: 'Bounties',
          faction: 'Grineer',
          efficiencyRating: 'Great',
          strategyNote: 'Fast Tier 1 bounty runs from Quinn in the Chrysalith.',
        },
      ],
    },
    {
      id: 'vainthorn',
      name: 'Vainthorn',
      category: 'Special',
      planets: ['Ceres'],
      description: 'Thorn-like resource harvested from the Abyssal Zone on Ceres.',
      acquisition: 'Acquired by completing [Abyssal Zone](https://wiki.warframe.com/w/Abyssal_Zone) missions on [Ceres](https://wiki.warframe.com/w/Ceres) using [Abyssal Beacons](https://wiki.warframe.com/w/Abyssal_Beacon). Additional Vainthorns are awarded on [The Steel Path](https://wiki.warframe.com/w/The_Steel_Path).',
      recommendedFrames: [],
      optimalNodes: [],
    },
    {
      id: 'steel_essence',
      name: 'Steel Essence',
      category: 'Special',
      planets: [],
      description: 'Tokens of Teshin\'s Esteem earned from Incursion Alerts or Acolytes on The Steel Path.',
      acquisition: 'Dropped by [Acolytes](https://wiki.warframe.com/w/Acolytes) during Steel Path missions, and rewarded from daily Steel Path Incursion alerts.',
      recommendedFrames: [],
      optimalNodes: [],
    },
  ];

import allResourcesJson from './generated/all-resources.json';

interface RawResourceItem {
  id: string;
  name: string;
  category?: string;
  type?: string;
  description?: string;
  imageName?: string;
  tradable?: boolean;
  planets?: string[];
  recommendedFarmingText?: string;
  wikiUrl?: string;
  acquisitionText?: string;
}

export function synthesizeResourceGuide(r: RawResourceItem): ResourceFarmingGuide {
  const nameLower = r.name.toLowerCase();
  const descLower = (r.description || '').toLowerCase();
  let cat: ResourceCategory = 'Common';

  if (
    [
      'argon crystal',
      'tellurium',
      'orokin cell',
      'morphics',
      'neural sensors',
      'neurodes',
      'gallium',
      'control module',
    ].includes(nameLower) ||
    descLower.includes('rare')
  ) {
    cat = 'Rare';
  } else if (
    [
      'circuits',
      'plastids',
      'polymer bundle',
      'rubedo',
      'cryotic',
      'oxium',
    ].includes(nameLower) ||
    descLower.includes('uncommon')
  ) {
    cat = 'Uncommon';
  } else if (
    descLower.includes('plains of eidolon') ||
    descLower.includes('orb vallis') ||
    descLower.includes('cambion drift') ||
    descLower.includes('duviri') ||
    descLower.includes('mining') ||
    descLower.includes('gem') ||
    descLower.includes('ore')
  ) {
    cat = 'OpenWorld';
  }

  const optimalNodes: OptimalFarmNode[] = [];
  if (r.recommendedFarmingText) {
    const regex = /([A-Za-z0-9\s'-]+?)\s*\(\s*([A-Za-z0-9\s'-]+?)\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(r.recommendedFarmingText)) !== null) {
      const nodeName = match[1].replace(/^(or|and)\s+/i, '').trim();
      const planetName = match[2].trim();
      if (nodeName && planetName) {
        optimalNodes.push({
          node: nodeName,
          planet: planetName,
          missionType: 'Survival / Dark Sector',
          faction: 'Infested',
          efficiencyRating: optimalNodes.length === 0 ? 'Best' : 'Great',
          strategyNote: `Official wiki recommended farming node on ${planetName}. Run endless Dark Sector or Survival with squad loot frames.`,
        });
      }
    }

    if (optimalNodes.length === 0 && r.recommendedFarmingText.trim()) {
      optimalNodes.push({
        node: 'Recommended Nodes',
        planet: (r.planets && r.planets[0]) || 'Origin System',
        missionType: 'Endless Mission',
        faction: 'Neutral',
        efficiencyRating: 'Best',
        strategyNote: r.recommendedFarmingText,
      });
    }
  } else if (r.planets && r.planets.length > 0) {
    for (let i = 0; i < Math.min(3, r.planets.length); i++) {
      const p = r.planets[i];
      optimalNodes.push({
        node: `${p} Missions`,
        planet: p,
        missionType: 'Survival / Defense',
        faction: 'Neutral',
        efficiencyRating: i === 0 ? 'Best' : 'Great',
        strategyNote: `Drops from enemies, storage containers, and resource deposits across ${p}.`,
      });
    }
  }

  // Only assign squad loot frames if there are actual physical drop nodes to farm
  const recommendedFrames = optimalNodes.length > 0
    ? [
        'Nekros (Desecrate)',
        'Khora (Pilfering Strangledome)',
        'Hydroid (Pilfering Swarm)',
      ]
    : [];

  return {
    id: r.id,
    name: r.name,
    category: cat,
    planets: r.planets || [],
    description: r.description || 'Warframe crafting component.',
    acquisition: r.acquisitionText || undefined,
    recommendedFrames,
    optimalNodes,
  };
}

export function getResourceGuide(idOrName: string): ResourceFarmingGuide | undefined {
  if (!idOrName) return undefined;
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const lowerName = idOrName.toLowerCase();

  const curated = RESOURCE_GUIDES.find(
    (g) => g.id === normalized || (g.name && g.name.toLowerCase() === lowerName)
  );
  if (curated) return curated;

  const catalog = allResourcesJson as RawResourceItem[];
  const raw = catalog.find(
    (r) => r.id === normalized || (r.name && r.name.toLowerCase() === lowerName)
  );
  if (raw) {
    return synthesizeResourceGuide(raw);
  }

  return undefined;
}

export function getAllResourceGuides(): ResourceFarmingGuide[] {
  const seen = new Set<string>();
  const all: ResourceFarmingGuide[] = [];

  for (const g of RESOURCE_GUIDES) {
    if (g.name) seen.add(g.name.toLowerCase());
    if (g.id) seen.add(g.id);
    all.push(g);
  }

  const catalog = allResourcesJson as RawResourceItem[];
  for (const r of catalog) {
    const rLower = (r.name || '').toLowerCase();
    if (rLower && !seen.has(rLower) && !seen.has(r.id)) {
      seen.add(rLower);
      if (r.id) seen.add(r.id);
      all.push(synthesizeResourceGuide(r));
    }
  }

  return all;
}

export function searchResourceGuides(query: string): ResourceFarmingGuide[] {
  if (!query) return getAllResourceGuides();
  const q = query.toLowerCase().trim();
  const allGuides = getAllResourceGuides();
  if (!q) return allGuides;

  return allGuides.filter(
    (g) =>
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.planets && g.planets.some((p) => p && p.toLowerCase().includes(q))) ||
      (g.description && g.description.toLowerCase().includes(q)) ||
      (g.optimalNodes && g.optimalNodes.some((n) => n.node && n.node.toLowerCase().includes(q)))
  );
}

