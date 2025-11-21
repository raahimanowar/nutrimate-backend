// Unit conversion utilities
export interface UnitConversion {
  toBase: number;
  fromBase: number;
  type: 'weight' | 'volume' | 'count';
}

// Conversion factors to base units
export const UNIT_CONVERSIONS: Record<string, UnitConversion> = {
  // Weight units (base: grams)
  'kg': { toBase: 1000, fromBase: 0.001, type: 'weight' },
  'g': { toBase: 1, fromBase: 1, type: 'weight' },
  'lb': { toBase: 453.592, fromBase: 0.00220462, type: 'weight' },
  'oz': { toBase: 28.3495, fromBase: 0.035274, type: 'weight' },

  // Volume units (base: milliliters)
  'l': { toBase: 1000, fromBase: 0.001, type: 'volume' },
  'ml': { toBase: 1, fromBase: 1, type: 'volume' },
  'gal': { toBase: 3785.41, fromBase: 0.000264172, type: 'volume' },
  'qt': { toBase: 946.353, fromBase: 0.00105669, type: 'volume' },
  'pt': { toBase: 473.176, fromBase: 0.00211338, type: 'volume' },
  'cup': { toBase: 236.588, fromBase: 0.00422675, type: 'volume' },
  'fl oz': { toBase: 29.5735, fromBase: 0.033814, type: 'volume' },

  // Count units (base: pieces)
  'pieces': { toBase: 1, fromBase: 1, type: 'count' },
  'items': { toBase: 1, fromBase: 1, type: 'count' },
  'servings': { toBase: 1, fromBase: 1, type: 'count' },
  'units': { toBase: 1, fromBase: 1, type: 'count' },
  'dozen': { toBase: 12, fromBase: 0.0833333, type: 'count' },
  'pair': { toBase: 2, fromBase: 0.5, type: 'count' },
  'pack': { toBase: 1, fromBase: 1, type: 'count' }, // Can be customized
  'box': { toBase: 1, fromBase: 1, type: 'count' },   // Can be customized
  'bottle': { toBase: 1, fromBase: 1, type: 'count' }, // Can be customized
  'jar': { toBase: 1, fromBase: 1, type: 'count' },    // Can be customized
  'can': { toBase: 1, fromBase: 1, type: 'count' }     // Can be customized
};

// Get base unit for a given unit
export function getBaseUnit(unit: string): 'g' | 'ml' | 'pieces' {
  const conversion = UNIT_CONVERSIONS[unit];
  if (!conversion) {
    throw new Error(`Unknown unit: ${unit}`);
  }

  switch (conversion.type) {
    case 'weight': return 'g';
    case 'volume': return 'ml';
    case 'count': return 'pieces';
    default: return 'pieces';
  }
}

// Convert quantity to base unit
export function convertToBase(quantity: number, unit: string): number {
  const conversion = UNIT_CONVERSIONS[unit];
  if (!conversion) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return quantity * conversion.toBase;
}

// Convert quantity from base unit
export function convertFromBase(baseQuantity: number, unit: string): number {
  const conversion = UNIT_CONVERSIONS[unit];
  if (!conversion) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return baseQuantity * conversion.fromBase;
}

// Check if two units are compatible (same type)
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const conv1 = UNIT_CONVERSIONS[unit1];
  const conv2 = UNIT_CONVERSIONS[unit2];

  if (!conv1 || !conv2) return false;
  return conv1.type === conv2.type;
}

// Format quantity with appropriate precision
export function formatQuantity(quantity: number, unit: string): string {
  let decimals = 0;

  // Determine precision based on unit
  if (['kg', 'lb'].includes(unit)) {
    decimals = 2;
  } else if (['g', 'oz', 'ml', 'l'].includes(unit)) {
    decimals = 1;
  } else if (['cup', 'fl oz'].includes(unit)) {
    decimals = 2;
  }

  return `${quantity.toFixed(decimals)} ${unit}`;
}

// Calculate remaining quantity in display units
export function calculateDisplayQuantity(baseQuantity: number, unit: string): number {
  return convertFromBase(baseQuantity, unit);
}