import baseMeleeWeaponsJSON from './weapons/baseMeleeWeapons.json';
import baseRangeWeaponsJSON from './weapons/baseRangeWeapons.json';
import baseArmorJSON from './weapons/baseArmor.json';
import { get, writable } from 'svelte/store';

const weaponsJSON = Object.values({ ...baseMeleeWeaponsJSON, ...baseRangeWeaponsJSON })

export type BaseItem = {
    name: string
    flavorText: string
    description: string
    cost: number 
    costUnit: string,
    weight: number
    weightUnit: string
    properties: string[]
    requirements: string[]
    group: string
    rarity: string
}

export type Weapon = BaseItem & {
    damage: string
    damageTypes: string[]
    range: string
}


export type Armor = BaseItem & {
    resistance: string
    resistanceTypes: string[]
}

export type Item = BaseItem | Weapon | Armor

export const weapons = writable<Weapon[]>(weaponsJSON.map(json => {
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
}));



export const armors = writable<Armor[]>(baseArmorJSON.map(json => {
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
}));

export const allItems = writable<Item[]>([]);

const updateAllItems = () => {
    const combined = [...get(armors), ...get(weapons)];
    allItems.set(combined);
};


armors.subscribe(updateAllItems);
weapons.subscribe(updateAllItems);