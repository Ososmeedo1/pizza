export const SIZE_ORDER = ["S", "M", "L"];

export const SIZE_NAMES = {
  S: {ar: "صغير", en: "Small"},
  M: {ar: "وسط", en: "Medium"},
  L: {ar: "كبير", en: "Large"},
};

function toPrice(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toBasePrice(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Maps a sizePrices object ({S, M, L} values as strings or numbers) into
 * measuring-unit option docs in S, M, L order. Only filled sizes are kept,
 * names are auto-derived (never trusted from client input). Empty object or
 * all-empty values yield []. Returns [] for anything non-object.
 */
export function sizePricesToOptions(sizePrices) {
  if (!sizePrices || typeof sizePrices !== "object") {
    return [];
  }

  const options = [];
  SIZE_ORDER.forEach((key, index) => {
    const price = toPrice(sizePrices[key]);
    if (price === null) {
      return;
    }
    options.push({
      key,
      price,
      name: SIZE_NAMES[key],
      isActive: true,
      sortOrder: index,
    });
  });

  return options;
}

/**
 * Server-side derivation shared by the product create/update routes. Rebuilds
 * the stored pricing model from the raw size grid and base price:
 *
 * - any size filled -> measuringUnit = {unitType: "size", options}, the
 *   stored price becomes the cheapest filled size, hasMeasuringUnit = true.
 * - all sizes empty  -> no options, hasMeasuringUnit = false, the stored
 *   price is the base price.
 */
export function deriveSizePricing(sizePrices, basePrice) {
  const options = sizePricesToOptions(sizePrices);
  const hasMeasuringUnit = options.length > 0;

  return {
    hasMeasuringUnit,
    measuringUnit: {unitType: "size", options},
    price: hasMeasuringUnit
      ? Math.min(...options.map((option) => option.price))
      : toBasePrice(basePrice),
  };
}