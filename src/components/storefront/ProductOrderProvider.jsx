"use client";

import {createContext, useCallback, useContext, useMemo, useState} from "react";
import {Phone} from "lucide-react";
import {formatPrice} from "@/lib/catalog";
import {cn, normalizePhone} from "@/lib/utils";

const ProductOrderContext = createContext(null);

export function useProductOrder() {
  const context = useContext(ProductOrderContext);

  if (!context) {
    throw new Error("useProductOrder must be used within ProductOrderProvider");
  }

  return context;
}

export function ProductOrderProvider({
  product,
  addOns = [],
  phone = null,
  labels,
  currency,
  locale,
  children,
}) {
  const normalizedPhone = normalizePhone(phone);
  const phoneHref = normalizedPhone ? `tel:${normalizedPhone}` : null;
  const ctaAvailable = Boolean(phoneHref) && product.isAvailable !== false;

  const initialUnitIndex = useCallback(() => {
    if (!product.hasMeasuringUnit) {
      return 0;
    }
    return product.measuringUnit?.options?.length > 0 ? 0 : -1;
  }, [product]);

  const [selectedUnitIndex, setSelectedUnitIndex] = useState(initialUnitIndex);
  const [selectedAddOnIndexes, setSelectedAddOnIndexes] = useState(() => []);

  const unitOptions = useMemo(
    () => (product.hasMeasuringUnit ? product.measuringUnit?.options ?? [] : []),
    [product]
  );

  const addOnsEnabled =
    product.hasMeasuringUnit === true &&
    product.measuringUnit?.unitType === "size";

  const selectedKey = useMemo(() => {
    if (selectedUnitIndex < 0) {
      return "";
    }
    return unitOptions[selectedUnitIndex]?.key ?? "";
  }, [selectedUnitIndex, unitOptions]);

  const resolveAddOnPrice = useCallback(
    (addOn) => {
      if (!addOnsEnabled) {
        return null;
      }
      if (addOn.priceMode === "flat") {
        return typeof addOn.price === "number" ? addOn.price : null;
      }
      if (!selectedKey) {
        return null;
      }
      const value = addOn.sizePrices?.[selectedKey];
      return typeof value === "number" ? value : null;
    },
    [addOnsEnabled, selectedKey]
  );

  const effectiveSelectedAddOnIndexes = useMemo(
    () =>
      selectedAddOnIndexes.filter(
        (index) => addOns[index] && resolveAddOnPrice(addOns[index]) !== null
      ),
    [selectedAddOnIndexes, addOns, resolveAddOnPrice]
  );

  const toggleAddOn = useCallback(
    (index) => {
      if (!addOns[index] || resolveAddOnPrice(addOns[index]) === null) {
        return;
      }
      setSelectedAddOnIndexes((current) =>
        current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index]
      );
    },
    [addOns, resolveAddOnPrice]
  );

  const unitPrice = useMemo(() => {
    const selectedOption = unitOptions[selectedUnitIndex];
    if (selectedOption && typeof selectedOption.price === "number") {
      return selectedOption.price;
    }
    return typeof product.price === "number" ? product.price : 0;
  }, [unitOptions, selectedUnitIndex, product.price]);

  const addOnTotal = useMemo(
    () =>
      effectiveSelectedAddOnIndexes.reduce(
        (sum, index) => sum + (resolveAddOnPrice(addOns[index]) ?? 0),
        0
      ),
    [effectiveSelectedAddOnIndexes, addOns, resolveAddOnPrice]
  );

  const totalPrice = unitPrice + addOnTotal;

  const ctaLabel = ctaAvailable ? labels.cta : labels.unconfiguredChannel;

  const ctaClassName = cn(
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-md transition-colors duration-300",
    "hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50"
  );

  const value = {
    selectedUnitIndex,
    setSelectedUnitIndex,
    addOns,
    addOnsEnabled,
    resolveAddOnPrice,
    selectedAddOnIndexes: effectiveSelectedAddOnIndexes,
    toggleAddOn,
    totalPrice,
    phoneHref,
    ctaAvailable,
    ctaLabel,
  };

  return (
    <ProductOrderContext.Provider value={value}>
      {children}
      <div
        data-sticky-order-bar
        className="sticky bottom-0 z-40 mt-2 w-full border-t border-border/50 bg-background/95 px-4 pb-3 pt-3 shadow-clay-md backdrop-blur-md sm:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 basis-auto items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums tracking-tight">
              {formatPrice(totalPrice, locale)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {currency}
            </span>
          </div>
          {ctaAvailable ? (
            <a
              data-order-cta="sticky"
              href={phoneHref}
              className={cn(ctaClassName, "min-w-0 flex-1")}
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span className="truncate">{ctaLabel}</span>
            </a>
          ) : (
            <span
              data-order-cta="sticky"
              aria-disabled="true"
              className={cn(ctaClassName, "min-w-0 flex-1 cursor-not-allowed opacity-50")}
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span className="truncate">{ctaLabel}</span>
            </span>
          )}
        </div>
      </div>
    </ProductOrderContext.Provider>
  );
}