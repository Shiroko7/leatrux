import baseArmorJSON from "./weapons/baseArmor.json";
import baseArtisanToolsJSON from "./weapons/baseArtisanTools.json";
import baseGamingSetsJSON from "./weapons/baseGamingSets.json";
import baseMeleeWeaponsJSON from "./weapons/baseMeleeWeapons.json";
import baseMusicalInstrument from "./weapons/baseMusicalInstruments.json";
import baseRangeWeaponsJSON from "./weapons/baseRangeWeapons.json";
import baseOtherJSON from "./weapons/baseOther.json"
import baseAmmuniutionJSON from "./weapons/baseAmmunition.json"

const weaponsJSON = [...baseMeleeWeaponsJSON, ...baseRangeWeaponsJSON];

export type BaseItem = {
    name: string;
    flavorText: string;
    description: string;
    cost: number;
    costUnit: string;
    weight: number;
    weightUnit: string;
    properties: string[];
    requirements: string[];
    group: string;
    rarity: string;
};

export type Weapon = BaseItem & {
    damage: string;
    damageTypes: string[];
    range: string;
};

export type Armor = BaseItem & {
    resistance: string;
    resistanceTypes: string[];
};

export type Item = BaseItem | Weapon | Armor;

const transformWeapon = (json: any): Weapon => {
    const {
        Name = "",
        FlavorText = "",
        Cost = 0,
        CostUnit = "",
        Damage = "",
        Damagetypes = [],
        Weight = 0,
        WeightUnit = "",
        Properties = [],
        Requirements = [],
        Group = "",
        Rarity = "",
        Range = "",
    } = json;

    return {
        name: Name,
        flavorText: FlavorText,
        description: "",
        cost: Cost,
        costUnit: CostUnit,
        damage: Damage,
        damageTypes: Damagetypes,
        weight: Weight,
        weightUnit: WeightUnit,
        properties: Properties,
        requirements: Requirements,
        group: Group,
        rarity: Rarity,
        range: Range,
    };
};

const transformArmor = (json: any): Armor => {
    const {
        Name = "",
        FlavorText = "",
        Cost = 0,
        CostUnit = "",
        Resistance = "",
        ResistanceTypes = [],
        Weight = 0,
        WeightUnit = "",
        Properties = [],
        Requirements = [],
        Group = "",
        Rarity = "",
    } = json;

    return {
        name: Name,
        flavorText: FlavorText,
        description: "",
        cost: Cost,
        costUnit: CostUnit,
        resistance: Resistance,
        resistanceTypes: ResistanceTypes,
        weight: Weight,
        weightUnit: WeightUnit,
        properties: Properties,
        requirements: Requirements,
        group: Group,
        rarity: Rarity,
    };
};

const transformBaseItem = (json: any): BaseItem => {
    const {
        Name = "",
        FlavorText = "",
        Description = "",
        Cost = 0,
        CostUnit = "",
        Weight = 0,
        WeightUnit = "",
        Properties = [],
        Requirements = [],
        Group = "",
        Rarity = "",
    } = json;

    return {
        name: Name,
        flavorText: FlavorText,
        description: Description,
        cost: Cost,
        costUnit: CostUnit,
        weight: Weight,
        weightUnit: WeightUnit,
        properties: Properties,
        requirements: Requirements,
        group: Group,
        rarity: Rarity,
    };
};

export const allItemsMap: { [key: string]: BaseItem[] | Weapon[] | Armor[] } = {
  armors: baseArmorJSON.map(transformArmor),
  tools: baseArtisanToolsJSON.map(transformBaseItem),
  gamingSets: baseGamingSetsJSON.map(transformBaseItem),
  weapons: weaponsJSON.map(transformWeapon),
  instruments: baseMusicalInstrument.map(transformBaseItem),
  otherItems: baseOtherJSON.map(transformBaseItem),
  ammunition: baseAmmuniutionJSON.map(transformBaseItem),
};

export const allItems = [...allItemsMap.weapons, ...allItemsMap.armors, ...allItemsMap.tools, ...allItemsMap.gamingSets, ...allItemsMap.instruments, ...allItemsMap.otherItems, ...allItemsMap.ammunition];


export function translateFileName(fileName: string): string {
  const itemFiles: { [key: string]: string } = {
    "baseArmor.json": "armors",
    "baseArtisanTools.json": "tools",
    "baseGamingSets.json": "gamingSets",
    "baseMeleeWeapons.json": "weapons",
    "baseMusicalInstruments.json": "instruments",
    "baseOther.json": "otherItems",
    "baseAmmunition.json": "ammunition"
  };
  return itemFiles[fileName] || ""
}
