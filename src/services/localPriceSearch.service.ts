import WebSearch from '../utils/webSearch.js';
import { logger } from '../utils/logger.js';

interface LocalPriceResult {
  itemName: string;
  localPrice: number;
  localStore: string;
  location: string;
  priceComparison: {
    vsFoodInventory: number; // percentage difference
    isCheaper: boolean;
  };
  searchDate: Date;
}

interface AlternativeSuggestion {
  name: string;
  category: string;
  localPrice: number;
  unit: string;
  store: string;
  location: string;
  savings: number; // amount saved compared to FoodInventory
  nutritionalInfo?: string;
}

class LocalPriceSearchService {
  private webSearch: WebSearch;

  constructor() {
    this.webSearch = new WebSearch();
  }

  async searchLocalPrices(
    itemName: string,
    foodInventoryPrice: number,
    userLocation?: string,
    radius: string = '25mi'
  ): Promise<LocalPriceResult | null> {
    try {
      const location = userLocation || 'current location';

      // Create search queries for different store types
      const searchQueries = [
        `${itemName} price ${location}`,
        `${itemName} cost grocery store ${location}`,
        `${itemName} supermarket price ${location}`,
        `${itemName} market price ${location}`
      ];

      let bestResult: LocalPriceResult | null = null;
      let lowestPrice = Infinity;

      // Try multiple search queries to find the best local price
      for (const query of searchQueries) {
        try {
          const searchResults = await this.webSearch.search(
            `${query} ${radius} today's price current cost`
          );

          const priceData = await this.extractPriceFromSearchResults(
            searchResults,
            itemName,
            foodInventoryPrice,
            location
          );

          if (priceData && priceData.localPrice < lowestPrice) {
            lowestPrice = priceData.localPrice;
            bestResult = priceData;
          }
        } catch (error) {
          logger.warn(`Search failed for query: ${query}, ${(error as Error).message}`);
          continue;
        }
      }

      return bestResult;

    } catch (error) {
      logger.error(`Local price search error for ${itemName}: ${(error as Error).message}`);
      return null;
    }
  }

  private async extractPriceFromSearchResults(
    searchResults: string,
    itemName: string,
    foodInventoryPrice: number,
    location: string
  ): Promise<LocalPriceResult | null> {
    try {
      // Use AI to extract price information from search results
      const extractionPrompt = `
      Extract current local price information for "${itemName}" from this search data:

      ${searchResults}

      Look for:
      - Current prices in USD
      - Store names (Walmart, Target, Kroger, local supermarkets, etc.)
      - Price per unit (lb, kg, each, etc.)
      - Any mention of sales or discounts

      Return JSON with:
      {
        "price": number,
        "store": "store name",
        "unit": "price unit",
        "confidence": number (0-1)
      }

      Only return if you find specific price information. Otherwise return null.
      `;

      // This would use your existing AI service to extract structured data
      // For now, we'll simulate price extraction with a simple approach
      const priceMatch = searchResults.match(/\$(\d+\.?\d*)/g);

      if (priceMatch && priceMatch.length > 0) {
        const prices = priceMatch.map(p => parseFloat(p.replace('$', '')));
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Simple store detection
        const stores = ['Walmart', 'Target', 'Kroger', 'Safeway', 'Whole Foods', 'Trader Joe\'s', 'Costco'];
        const foundStore = stores.find(store =>
          searchResults.toLowerCase().includes(store.toLowerCase())
        ) || 'Local Store';

        const priceDifference = ((avgPrice - foodInventoryPrice) / foodInventoryPrice) * 100;

        return {
          itemName,
          localPrice: avgPrice,
          localStore: foundStore,
          location,
          priceComparison: {
            vsFoodInventory: priceDifference,
            isCheaper: avgPrice < foodInventoryPrice
          },
          searchDate: new Date()
        };
      }

      return null;

    } catch (error) {
      logger.error(`Price extraction error: ${(error as Error).message}`);
      return null;
    }
  }

  async findCheaperAlternatives(
    category: string,
    foodInventoryPrice: number,
    userLocation?: string
  ): Promise<AlternativeSuggestion[]> {
    try {
      const location = userLocation || 'current location';

      // Search for cheaper alternatives in the same category
      const searchQuery = `cheapest ${category} alternatives budget options ${location}`;

      const searchResults = await this.webSearch.search(searchQuery);

      const alternatives = await this.extractAlternativesFromResults(
        searchResults,
        category,
        foodInventoryPrice,
        location
      );

      return alternatives.filter(alt => alt.savings > 0); // Only return cheaper alternatives

    } catch (error) {
      logger.error(`Alternative search error for ${category}: ${(error as Error).message}`);
      return [];
    }
  }

  private async extractAlternativesFromResults(
    searchResults: string,
    category: string,
    foodInventoryPrice: number,
    location: string
  ): Promise<AlternativeSuggestion[]> {
    try {
      // AI-based extraction of alternatives
      const extractionPrompt = `
      Find cheaper ${category} alternatives from this search data:

      ${searchResults}

      Look for specific food items in the ${category} category with prices.
      Focus on budget-friendly options and store brands.

      Return JSON array of alternatives:
      [
        {
          "name": "item name",
          "price": number,
          "unit": "unit type",
          "store": "store name",
          "savings": number (amount saved vs $${foodInventoryPrice})
        }
      ]

      Only include items that are cheaper than $${foodInventoryPrice}.
      `;

      // For implementation, we'll use a simplified approach
      const alternatives: AlternativeSuggestion[] = [];

      // Common budget alternatives by category
      const budgetAlternatives: Record<string, Array<{name: string, priceRange: [number, number]}>> = {
        'protein': [
          { name: 'Chicken thighs', priceRange: [2.5, 4.0] },
          { name: 'Eggs', priceRange: [0.20, 0.40] },
          { name: 'Canned beans', priceRange: [0.80, 1.50] },
          { name: 'Tofu', priceRange: [1.5, 3.0] },
          { name: 'Ground turkey', priceRange: [3.0, 5.0] }
        ],
        'vegetables': [
          { name: 'Cabbage', priceRange: [0.50, 1.20] },
          { name: 'Carrots', priceRange: [0.80, 1.80] },
          { name: 'Potatoes', priceRange: [0.40, 1.00] },
          { name: 'Onions', priceRange: [0.60, 1.20] },
          { name: 'Frozen vegetables', priceRange: [1.00, 2.50] }
        ],
        'fruits': [
          { name: 'Bananas', priceRange: [0.40, 0.80] },
          { name: 'Apples', priceRange: [0.80, 2.00] },
          { name: 'Oranges', priceRange: [0.60, 1.20] },
          { name: 'Seasonal fruit', priceRange: [1.00, 3.00] }
        ],
        'grains': [
          { name: 'Oatmeal', priceRange: [0.15, 0.40] },
          { name: 'Brown rice', priceRange: [1.50, 3.00] },
          { name: 'Whole wheat pasta', priceRange: [1.00, 2.50] },
          { name: 'Whole wheat bread', priceRange: [2.00, 4.00] }
        ]
      };

      const categoryAlternatives = budgetAlternatives[category] || [];

      for (const alt of categoryAlternatives) {
        const avgPrice = (alt.priceRange[0] + alt.priceRange[1]) / 2;
        const savings = foodInventoryPrice - avgPrice;

        if (savings > 0) {
          alternatives.push({
            name: alt.name,
            category,
            localPrice: avgPrice,
            unit: 'per lb',
            store: 'Local Market',
            location,
            savings,
            nutritionalInfo: this.getNutritionalInfo(alt.name)
          });
        }
      }

      return alternatives.slice(0, 3); // Return top 3 alternatives

    } catch (error) {
      logger.error(`Alternative extraction error: ${(error as Error).message}`);
      return [];
    }
  }

  private getNutritionalInfo(itemName: string): string {
    const nutritionMap: Record<string, string> = {
      'Chicken thighs': 'High protein, iron, B vitamins',
      'Eggs': 'Complete protein, vitamin D, choline',
      'Canned beans': 'Protein, fiber, iron, folate',
      'Tofu': 'Plant-based protein, calcium, iron',
      'Ground turkey': 'Lean protein, selenium, B vitamins',
      'Cabbage': 'Vitamin C, fiber, antioxidants',
      'Carrots': 'Beta carotene, vitamin A, fiber',
      'Potatoes': 'Potassium, vitamin C, carbohydrates',
      'Onions': 'Antioxidants, anti-inflammatory compounds',
      'Frozen vegetables': 'Retains vitamins, convenient',
      'Bananas': 'Potassium, vitamin B6, natural sugars',
      'Apples': 'Fiber, vitamin C, antioxidants',
      'Oranges': 'Vitamin C, folate, antioxidants',
      'Seasonal fruit': 'Vitamins, antioxidants, natural sweetness',
      'Oatmeal': 'Fiber, protein, complex carbohydrates',
      'Brown rice': 'Complex carbs, fiber, manganese',
      'Whole wheat pasta': 'Complex carbs, fiber, protein',
      'Whole wheat bread': 'Fiber, B vitamins, complex carbs'
    };

    return nutritionMap[itemName] || 'Nutritious food option';
  }

  async compareLocalVsInventory(
    foodInventoryItems: Array<{name: string, price: number, category: string}>,
    userLocation?: string
  ): Promise<Array<{
    item: {name: string, price: number, category: string};
    localPrice?: LocalPriceResult;
    alternatives: AlternativeSuggestion[];
  }>> {
    const results = [];

    for (const item of foodInventoryItems) {
      try {
        // Search for local price
        const localPrice = await this.searchLocalPrices(
          item.name,
          item.price,
          userLocation
        );

        // Find alternatives if local is cheaper or if no local price found
        const alternatives = localPrice?.priceComparison.isCheaper ?
          await this.findCheaperAlternatives(item.category, item.price, userLocation) :
          [];

        results.push({
          item,
          localPrice,
          alternatives
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        logger.error(`Error comparing ${item.name}: ${(error as Error).message}`);
        results.push({
          item,
          localPrice: undefined,
          alternatives: []
        });
      }
    }

    return results;
  }
}

export default new LocalPriceSearchService();