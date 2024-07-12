import merchantsJSON from './merchants.json';

export type Source = {
    filename: string;
    items: string[];
} 

export type Merchant = {
    [key: string]: Source[];
}

export const merchants: { [key: string]: Source[]; } = merchantsJSON;

export function getItemsForMerchant(merchantName: string): string[] {
    const merchantSources = merchants[merchantName];
    if (!merchantSources) {
        return [];
    }
    return merchantSources.flatMap(source => source.items);
}


export function getFilenamesWithWildcardItems(merchantName: string): string[] {
    const merchantSources = merchants[merchantName];
    if (!merchantSources) {
        return [];
    }
    const filenames: string[] = [];
    merchantSources.forEach(source => {
        if (source.items.length === 1 && source.items[0] === "*") {
            filenames.push(source.filename);
        }
    });
    return filenames;
}

