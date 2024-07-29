
<script lang="ts">
  import { type Item } from "../../shop/items";
  export let selectedItem;

  function displayPropAndReq(Item: Item): string {
    const props = Item.properties ?? [];
    const reqs = Item.requirements ?? [];

    const combined = [...props, ...reqs];
    const result = combined.filter(Boolean).join(", ");

    return result ? result : "";
  }

  function colorRarity(rarity: string): string { 
    const rarityColors: Record<string, string> = {
        'Common': '#ffffff',
        'Uncommon': '#1eff00',
        'Rare': '#0070dd',
        'Very Rare': '#a335ee',
        'Legendary': '#ff8000',
        'Artifact': '#e6cc80'
    };

    const color = rarityColors[rarity] || rarityColors['Common']; 
    return `<span style="color: ${color};">${rarity}</span>`;
  }
</script>



<!-- Item Details -->
<div class="flex-none w-1/4 m-2 bg-primary-content p-4">
{#if selectedItem}
  <div class="text-2xl">
    {selectedItem.name} 
  </div>
  <div>
    {@html colorRarity(selectedItem.rarity)}
  </div>
  <div class="text-xs py-4">
    <i>{displayPropAndReq(selectedItem)}</i>
  </div>
  <div>
    <p><i>{selectedItem.flavorText}</i></p>
  </div>
  <div class="text-xs pb-2">
    <p>{selectedItem.description}</p>
  </div>

  {#if "damage" in selectedItem}
    <div>
      <strong>Damage:</strong>
      {selectedItem.damage}
    </div>
    <div>
      <strong>Damage Types:</strong>
      {selectedItem.damageTypes}
    </div>
  {:else if "resistance" in selectedItem}
    <div>
      <strong>Resistance:</strong>
      {selectedItem.resistance}
    </div>
    {#if selectedItem.resistanceTypes && selectedItem.resistanceTypes.length > 0}
      <div>
        <strong>Resistance Types:</strong>
        {selectedItem.resistanceTypes}
      </div>
    {/if}
  {/if}
  {#if selectedItem.weight > 0 && selectedItem.weightUnit != ""}
      <div>
        <strong>Weight:</strong>
        {selectedItem.weight}
        {selectedItem.weightUnit}
      </div>
  {/if}
  {#if selectedItem.cost > 0 && selectedItem.costUnit != ""}
      <div>
        <strong>Cost:</strong>
        {selectedItem.cost}
        {selectedItem.costUnit}
      </div>
  {/if}
{/if}
</div>

