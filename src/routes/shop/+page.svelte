<script lang="ts">
  import { allItems, type Item } from "./items";
  import FuzzySearch from "fuzzy-search";

  let clickedItem: Item | null = $allItems[0];
  let hoveredItem: Item | null = null;
  $: selectedItem = hoveredItem || clickedItem;
  let sortOrder = 1; // 1 for ascending, -1 for descending
  let searchFilter: "";
  let selectedCategory: string = "";

  function toggleCategory(categoryName: string) {
    selectedCategory = categoryName;
  }
  function toggleSelection(ItemName: Item) {
    clickedItem = clickedItem === ItemName ? null : ItemName;
  }
  function hoverSelection(ItemName: Item) {
    hoveredItem = hoveredItem === ItemName ? null : ItemName;
  }

  function convertUnit(value: number, unit: string): number {
    if (unit == "sp") {
      return value / 10;
    } else if (unit == "cp") {
      return value / 100;
    }
    return value;
  }

  function sortByProperty(prop: keyof Item) {
    allItems.update((ItemsData) =>
      [...ItemsData].sort((a, b) => {
        var aValue = a[prop];
        var bValue = b[prop];
        if (prop == "cost") {
          aValue = convertUnit(aValue, a["costUnit"]);
          bValue = convertUnit(bValue, b["costUnit"]);
          console.log(aValue, bValue, a["costUnit"], b["costUnit"]);
        }

        return sortOrder * (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
      })
    );

    // Toggle the sort order for the next click
    sortOrder *= -1;
  }

  function fuzzySearchByName<T extends Item>(
    Items: T[],
    searchText: string
  ): T[] {
    const searcher = new FuzzySearch(Items, [
      "group",
      "range",
      "name",
      "properties",
      "requirements",
      "description",
    ]);
    return searcher.search(searchText);
  }
  function displayPropAndReq(Item: Item): string {
    const props = Item.properties ?? [];
    const reqs = Item.requirements ?? [];
    const rarity = Item.rarity ?? "";

    const combined = [rarity, ...props, ...reqs];
    const result = combined.filter(Boolean).join(", ");

    return result ? result : "";
  }
  function clearInput() {
    searchFilter = "";
  }

  const merchantText = "Welcome to my shop! I have a variety of items for sale. Click on an item to see more details.";

</script>

<div class="flex flex-col md:flex-row h-screen">
  <!-- Merchant -->
  <div class="flex-none w-1/6 m-2 border border-neutral">
    <div class="flex w-full h-1/3 bg-cover bg-center" style="background-image: url('/merchant.png');"></div>
    <div class="flex p-4">
      <p class="max-w-md">{merchantText}</p>
    </div>
    <div class="flex items-center bg-info-content p-1">
        <div class="flex-1">
          <input
            class="w-full border border-base-content pl-2"
            bind:value={searchFilter}
            placeholder="Search"
          />
        </div>
        <div class="ml-1 px-2 h-full border border-base-content">
          <button
            on:click={clearInput}
            class="cursor-pointer" 
          >
            X
          </button>
        </div>
    </div>
  </div>

  <!-- Categories -->
<div class="flex-initial m-2 border-collapse border border-neutral">
    <table>
      <thead class="uppercase">
        <tr class="bg-neutral">
          <th on:click={() => sortByProperty("name")}>Categories</th>
        </tr>
      </thead>
      <tbody>
        <tr on:click={() => toggleCategory("")}><td>All</td></tr>
        <tr on:click={() => toggleCategory("Armor")}><td>Armor</td></tr>
        <tr on:click={() => toggleCategory("Melee")}><td>Melee Items</td></tr>
        <tr on:click={() => toggleCategory("Ranged")}><td>Range Items</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Items -->
  <div
    class="flex-1 m-2 border-collapse border border-neutral overflow-hidden"
  >
    <div class="h-full overflow-auto">
    <table class="w-full">
      <thead class="uppercase">
        <tr class="bg-neutral">
          <th>
            <div class="flex items-center">
              Name <button on:click={() => sortByProperty("name")}>
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div></th
          >
          <th>
            <div class="flex items-center">
              Properties <button on:click={() => sortByProperty("properties")}>
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div></th
          >
          <th>
            <div class="flex items-center">
              Rarity <button on:click={() => sortByProperty("rarity")}>
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div></th
          >
          <th>
            <div class="flex items-center">
              Cost <button on:click={() => sortByProperty("cost")}>
                <svg
                  class="w-3 h-3 ms-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </div></th
          >
        </tr>
      </thead>
      <tbody>
        {#each fuzzySearchByName(fuzzySearchByName($allItems, selectedCategory), searchFilter) as item (item)}
          <tr
            class:selected={clickedItem === item}
            on:click={() => toggleSelection(item)}
            on:mouseover={() => hoverSelection(item)}
            on:focus={() => hoverSelection(item)}
            on:mouseout={() => hoverSelection(item)}
            on:blur={() => hoverSelection(item)}
          >
            <td>{item.name}</td>
            <td>{item.properties.join(", ")}</td>
            <td class="text-center">{item.rarity}</td>
            <td class="text-right whitespace-nowrap">{item.cost} {item.costUnit}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    </div>
  </div>

  <!-- Item Details -->
  <div class="flex-none w-1/4 m-2 bg-primary-content p-4">
    {#if selectedItem}
      <div class="text-2xl">
        {selectedItem.name}
      </div>
      <div class="text-xs py-4">
        <i>{displayPropAndReq(selectedItem)}</i>
      </div>
      <div>
        <p><i>{selectedItem.flavorText}</i></p>
      </div>
      <div>
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

      <div>
        <strong>Weight:</strong>
        {selectedItem.weight}
        {selectedItem.weightUnit}
      </div>
      <div>
        <strong>Cost:</strong>
        {selectedItem.cost}
        {selectedItem.costUnit}
      </div>
    {/if}
  </div>
</div>

<style>
  .selected {
    @apply bg-base-300;
  }
  tbody tr:hover {
    @apply bg-base-200;
  }
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    @apply bg-neutral;
  }
  td {
    @apply px-2 py-1;
  }
</style>
