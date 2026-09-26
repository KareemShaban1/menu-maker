import { createContext, useContext, type CSSProperties, type KeyboardEvent } from "react";
import type { TextStyle } from "@/lib/menuStorage";
import { textStyleToCss } from "@/lib/textStyle";

export type MenuLayout =
  | "fine-print"
  | "bistro"
  | "levantine"
  | "harbor"
  | "tavern"
  | "tasting"
  | "chalkboard"
  | "brew-board"
  | "garden"
  | "bistrot"
  | "shelf-tags"
  | "market"
  | "price-sheet"
  | "patisserie"
  | "kraft-bakery"
  | "cake-card"
  | "speakeasy"
  | "wine-list"
  | "sports-board"
  | "combo-board"
  | "street-stall"
  | "pizzeria";

export interface RealMenuPrice {
  name: string;
  price: number;
}

export interface RealMenuItem {
  name: string;
  description?: string;
  price: number;
  prices?: RealMenuPrice[];
  nameStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  priceStyle?: TextStyle;
}

export interface RealMenuCategory {
  name: string;
  items: RealMenuItem[];
  nameStyle?: TextStyle;
}

export type MenuTextChange = {
  kind: "title" | "vendor" | "category" | "item-name" | "item-description" | "item-price";
  categoryIndex?: number;
  itemIndex?: number;
  value: string;
};

export type MenuTextTarget = {
  kind: MenuTextChange["kind"];
  categoryIndex?: number;
  itemIndex?: number;
};

interface RealMenuDesignProps {
  layout?: string;
  name: string;
  categories: RealMenuCategory[];
  vendorName?: string;
  vendorLogo?: string;
  compact?: boolean;
  dir?: "ltr" | "rtl";
  currency?: string;
  titleStyle?: TextStyle;
  vendorStyle?: TextStyle;
  onTextChange?: (change: MenuTextChange) => void;
  onTextSelect?: (target: MenuTextTarget) => void;
}

interface MenuEditApi {
  name: string;
  vendorName?: string;
  categories: RealMenuCategory[];
  currency: string;
  titleStyle?: TextStyle;
  vendorStyle?: TextStyle;
  onChange?: (change: MenuTextChange) => void;
  onSelect?: (target: MenuTextTarget) => void;
}

const MenuEditContext = createContext<MenuEditApi | null>(null);

const useMenuEdit = () => useContext(MenuEditContext);

const CurrencyMark = ({ className = "" }: { className?: string }) => {
  const api = useMenuEdit();
  return <span className={className}>{api?.currency || "EGP"}</span>;
};

const paintFont = (family: string | undefined) => (node: HTMLSpanElement | null) => {
  if (!node) return;
  if (family) node.style.setProperty("font-family", family, "important");
  else node.style.removeProperty("font-family");
};

const LiveText = ({
  value,
  className,
  style,
  textStyle,
  placeholder,
  onCommit,
  onActivate,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
  textStyle?: TextStyle;
  placeholder?: string;
  onCommit?: (value: string) => void;
  onActivate?: () => void;
}) => {
  const css = { ...textStyleToCss(textStyle), ...style };
  const fontRef = paintFont(textStyle?.fontFamily);

  if (!onCommit) {
    if (!value) return null;
    return <span ref={fontRef} className={className} style={css}>{value}</span>;
  }

  const commit = (event: { currentTarget: HTMLElement }) => {
    const next = (event.currentTarget.textContent ?? "").replace(/\u00a0/g, " ").trim();
    if (next !== value) onCommit(next);
  };

  return (
    <span
      ref={fontRef}
      className={`${className ?? ""} cursor-text rounded-sm outline-none hover:ring-1 hover:ring-current/40 focus:ring-1 focus:ring-current/60`}
      style={css}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      onFocus={() => onActivate?.()}
      onBlur={commit}
      onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
};

const MenuTitle = ({ className, style }: { className?: string; style?: CSSProperties }) => {
  const api = useMenuEdit();
  if (!api) return null;
  return (
    <LiveText
      value={api.name}
      className={`${className ?? ""} ${api.titleStyle?.align ? "block w-full" : ""}`}
      style={style}
      textStyle={api.titleStyle}
      placeholder="Menu name"
      onCommit={api.onChange ? (value) => api.onChange?.({ kind: "title", value }) : undefined}
      onActivate={api.onSelect ? () => api.onSelect?.({ kind: "title" }) : undefined}
    />
  );
};

const VendorTitle = () => {
  const api = useMenuEdit();
  if (!api?.vendorName && !api?.onChange) return null;
  return (
    <LiveText
      value={api?.vendorName || ""}
      className={`text-center text-xs font-medium ${api?.vendorStyle?.align ? "block w-full" : ""}`}
      textStyle={api?.vendorStyle}
      placeholder="Vendor name"
      onCommit={api?.onChange ? (value) => api.onChange?.({ kind: "vendor", value }) : undefined}
      onActivate={api?.onSelect ? () => api.onSelect?.({ kind: "vendor" }) : undefined}
    />
  );
};

const CategoryTitle = ({ categoryIndex, className, style }: { categoryIndex: number; className?: string; style?: CSSProperties }) => {
  const api = useMenuEdit();
  const value = api?.categories[categoryIndex]?.name || "";
  return (
    <LiveText
      value={value}
      className={`${className ?? ""} ${api?.categories[categoryIndex]?.nameStyle?.align ? "block w-full" : ""}`}
      style={style}
      textStyle={api?.categories[categoryIndex]?.nameStyle}
      placeholder="Section name"
      onCommit={api?.onChange ? (next) => api.onChange?.({ kind: "category", categoryIndex, value: next }) : undefined}
      onActivate={api?.onSelect ? () => api.onSelect?.({ kind: "category", categoryIndex }) : undefined}
    />
  );
};

const ItemName = ({ categoryIndex, itemIndex, className, style }: { categoryIndex: number; itemIndex: number; className?: string; style?: CSSProperties }) => {
  const api = useMenuEdit();
  const value = api?.categories[categoryIndex]?.items[itemIndex]?.name || "";
  return (
    <LiveText
      value={value}
      className={className}
      style={style}
      textStyle={api?.categories[categoryIndex]?.items[itemIndex]?.nameStyle}
      placeholder="Item name"
      onCommit={api?.onChange ? (next) => api.onChange?.({ kind: "item-name", categoryIndex, itemIndex, value: next }) : undefined}
      onActivate={api?.onSelect ? () => api.onSelect?.({ kind: "item-name", categoryIndex, itemIndex }) : undefined}
    />
  );
};

const ItemDesc = ({ categoryIndex, itemIndex, className, style }: { categoryIndex: number; itemIndex: number; className?: string; style?: CSSProperties }) => {
  const api = useMenuEdit();
  const value = api?.categories[categoryIndex]?.items[itemIndex]?.description || "";
  if (!value && !api?.onChange) return null;
  return (
    <LiveText
      value={value}
      className={`${className ?? ""} ${api?.categories[categoryIndex]?.items[itemIndex]?.descriptionStyle?.align ? "block w-full" : ""}`}
      style={style}
      textStyle={api?.categories[categoryIndex]?.items[itemIndex]?.descriptionStyle}
      placeholder="Description"
      onCommit={api?.onChange ? (next) => api.onChange?.({ kind: "item-description", categoryIndex, itemIndex, value: next }) : undefined}
      onActivate={api?.onSelect ? () => api.onSelect?.({ kind: "item-description", categoryIndex, itemIndex }) : undefined}
    />
  );
};

const ItemPrice = ({ categoryIndex, itemIndex, className, withCurrency = false }: { categoryIndex: number; itemIndex: number; className?: string; withCurrency?: boolean }) => {
  const api = useMenuEdit();
  const value = api?.categories[categoryIndex]?.items[itemIndex]?.price ?? 0;
  return (
    <span className={`whitespace-nowrap tabular-nums ${className ?? ""}`}>
      <LiveText
        value={money(value)}
        textStyle={api?.categories[categoryIndex]?.items[itemIndex]?.priceStyle}
        placeholder="Price"
        onCommit={api?.onChange ? (next) => api.onChange?.({ kind: "item-price", categoryIndex, itemIndex, value: next }) : undefined}
        onActivate={api?.onSelect ? () => api.onSelect?.({ kind: "item-price", categoryIndex, itemIndex }) : undefined}
      />
      {withCurrency && <span className="text-[0.72em] font-medium opacity-70"> {api?.currency || "EGP"}</span>}
    </span>
  );
};

const LAYOUTS: MenuLayout[] = [
  "fine-print", "bistro", "levantine", "harbor", "tavern", "tasting",
  "chalkboard", "brew-board", "garden", "bistrot",
  "shelf-tags", "market", "price-sheet",
  "patisserie", "kraft-bakery", "cake-card",
  "speakeasy", "wine-list", "sports-board",
  "combo-board", "street-stall", "pizzeria",
];

export const templateLayout = (category: string, id: number): MenuLayout => {
  const map: Record<string, Record<number, MenuLayout>> = {
    restaurant: { 1: "fine-print", 2: "bistro", 3: "levantine", 4: "harbor", 5: "tavern", 6: "tasting" },
    cafe: { 1: "chalkboard", 2: "brew-board", 3: "garden", 4: "bistrot" },
    supermarket: { 1: "shelf-tags", 2: "market", 3: "price-sheet" },
    bakery: { 1: "patisserie", 2: "kraft-bakery", 3: "cake-card" },
    bar: { 1: "speakeasy", 2: "wine-list", 3: "sports-board" },
    fastfood: { 1: "combo-board", 2: "street-stall", 3: "pizzeria" },
  };
  return map[category]?.[id] || "fine-print";
};

const isLayout = (value?: string): value is MenuLayout => LAYOUTS.includes(value as MenuLayout);

const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(0));

const Price = ({ value, className = "" }: { value: number; className?: string }) => (
  <span className={`whitespace-nowrap tabular-nums ${className}`}>
    {money(value)} <CurrencyMark className="text-[0.72em] font-medium opacity-70" />
  </span>
);

const sliceCategories = (categories: RealMenuCategory[], compact?: boolean) =>
  compact
    ? categories.slice(0, 2).map((category) => ({ ...category, items: category.items.slice(0, 3) }))
    : categories;

const Leaders = ({
  item,
  nameClass,
  priceClass,
  descClass,
  rule = "border-current",
  categoryIndex,
  itemIndex,
}: {
  item: RealMenuItem;
  nameClass: string;
  priceClass: string;
  descClass: string;
  rule?: string;
  categoryIndex: number;
  itemIndex: number;
}) => (
  <div>
    <div className="flex items-baseline gap-2">
      <ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} className={nameClass} />
      <span className={`flex-1 border-b border-dotted ${rule} opacity-40 translate-y-[-2px]`} />
      <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} className={priceClass} withCurrency />
    </div>
    <ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} className={descClass} />
    {item.prices && item.prices.length > 0 && (
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {item.prices.map((size) => (
          <span key={size.name} className={descClass}>
            {size.name} · {money(size.price)}
          </span>
        ))}
      </div>
    )}
  </div>
);

const FinePrint = ({ name, categories, vendorName }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#f6f0e4] text-[#2a2118] px-6 py-8" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <div className="border-[3px] border-double border-[#b08948] px-6 py-8">
      <p className="text-center text-[10px] tracking-[0.45em] uppercase text-[#b08948]">Menu</p>
      <h2 className="text-center text-4xl mt-2" style={{ fontFamily: "Cormorant Garamond, serif" }}><MenuTitle /></h2>
      <div className="mx-auto mt-3 mb-8 h-px w-16 bg-[#b08948]" />
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-center text-xs tracking-[0.35em] uppercase text-[#8a6232] mb-4"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <Leaders
                  key={item.name}
                  item={item}
                  categoryIndex={categoryIndex}
                  itemIndex={itemIndex}
                  nameClass="text-[15px]"
                  priceClass="text-sm text-[#8a6232]"
                  descClass="text-[11px] italic text-[#6b5a45] mt-0.5 max-w-[85%]"
                  rule="border-[#8a6232]"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);

const Bistro = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-white text-neutral-900" style={{ fontFamily: "Inter, sans-serif" }}>
    <div className="bg-neutral-950 text-white px-6 py-7">
      <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-400">Today</p>
      <h2 className="text-3xl font-semibold mt-1"><MenuTitle /></h2>
    </div>
    <div className="px-5 py-6 space-y-7">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="inline-block bg-neutral-950 text-white text-xs tracking-widest uppercase px-3 py-1 mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <div className="grid grid-cols-1 gap-3">
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="border border-neutral-200 rounded-lg p-3 flex justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                  {item.description && <p className="text-xs text-neutral-500 mt-1"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
                </div>
                <span className="shrink-0 h-fit bg-neutral-950 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const Levantine = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fbf6ee] text-[#3b2416]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
    <div className="bg-[#6b1d2a] text-[#f4e4b3] text-center px-6 py-8 relative">
      <div className="absolute inset-3 border border-[#f4e4b3]/40" />
      <p className="relative text-[10px] tracking-[0.5em] uppercase">مطعم</p>
      <h2 className="relative text-4xl mt-1"><MenuTitle /></h2>
    </div>
    <div className="px-5 py-6 space-y-7">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex} className="text-center">
          <h3 className="text-xl text-[#6b1d2a]"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <p className="text-[#c4a15a] tracking-[0.6em] text-xs my-1">◆</p>
          <div className="space-y-4 text-start">
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="border-b border-[#e6d3b0] pb-3">
                <div className="flex justify-between gap-3 items-baseline">
                  <p className="text-lg leading-tight"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                  <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency className="text-[#6b1d2a] font-semibold" />
                </div>
                {item.description && <p className="text-xs text-[#7a624c] mt-1" style={{ fontFamily: "Lato, sans-serif" }}><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const Harbor = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#f3f7fb] text-[#123]" style={{ fontFamily: "Lato, sans-serif" }}>
    <div className="bg-[#0e3a5d] text-white px-6 py-6">
      <p className="text-[10px] tracking-[0.35em] uppercase text-sky-200">Catch of the day</p>
      <h2 className="text-3xl font-bold" style={{ fontFamily: "Libre Baskerville, serif" }}><MenuTitle /></h2>
      <svg viewBox="0 0 200 16" className="mt-3 w-40 h-4 text-sky-200" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M0 8 Q 12 0 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8" />
      </svg>
    </div>
    <div className="px-5 py-5 space-y-6">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-sky-800 font-bold uppercase tracking-wider text-xs border-b-2 border-sky-200 pb-1 mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          {category.items.map((item, itemIndex) => (
            <div key={item.name} className="py-2 border-b border-sky-100 flex justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-[#0e3a5d]"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-xs text-slate-500"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
              <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency className="font-bold text-[#0e3a5d]" />
            </div>
          ))}
        </section>
      ))}
    </div>
  </div>
);

const Tavern = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#e8d3ae] text-[#3a2714] px-5 py-7" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <div className="border-4 border-[#3a2714] px-4 py-6">
      <h2 className="text-center text-3xl uppercase tracking-wide"><MenuTitle /></h2>
      <p className="text-center text-[11px] mt-1 tracking-[0.25em] uppercase">From the kitchen</p>
      <div className="space-y-6 mt-6">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-center font-bold uppercase text-sm border-y-2 border-[#3a2714] py-1 mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="mb-3">
                <div className="flex justify-between gap-2 font-semibold">
                  <span><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></span>
                  <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
                </div>
                {item.description && <p className="text-xs mt-0.5" style={{ fontFamily: "Lato, sans-serif" }}><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

const Tasting = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#0e0e0e] text-[#f5f0e6] px-8 py-12 text-center" style={{ fontFamily: "Cormorant Garamond, serif" }}>
    <p className="text-[10px] tracking-[0.55em] uppercase text-[#c6a15b]">Tasting</p>
    <h2 className="text-4xl mt-3 font-medium"><MenuTitle /></h2>
    <div className="mx-auto my-6 w-10 h-px bg-[#c6a15b]" />
    <div className="space-y-10">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-[11px] tracking-[0.4em] uppercase text-[#c6a15b] mb-5"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <div className="space-y-6">
            {category.items.map((item, itemIndex) => (
              <div key={item.name}>
                <p className="text-2xl"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-xs text-[#b7ab96] mt-1 max-w-xs mx-auto" style={{ fontFamily: "Inter, sans-serif" }}><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
                <p className="text-xs tracking-[0.2em] uppercase text-[#c6a15b] mt-2"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const Chalkboard = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#1c2420] text-[#f3ecd4] px-6 py-8" style={{ fontFamily: "Caveat, cursive" }}>
    <div className="border border-[#f3ecd4]/30 rounded-sm px-4 py-6">
      <h2 className="text-center text-5xl"><MenuTitle /></h2>
      <p className="text-center text-xl opacity-70">served all day</p>
      <div className="mt-6 space-y-6">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-3xl border-b border-dashed border-[#f3ecd4]/40 pb-1 mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="flex justify-between gap-3 text-2xl leading-tight py-0.5">
                <span><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></span>
                <span><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

const BrewBoard = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#eceae6] text-[#1d1d1d]" style={{ fontFamily: "Roboto, sans-serif" }}>
    <div className="bg-[#111] text-white px-5 py-5 flex items-end justify-between">
      <h2 className="text-2xl font-black uppercase tracking-tight"><MenuTitle /></h2>
      <span className="text-[10px] tracking-[0.3em]">COFFEE</span>
    </div>
    <div className="p-4 space-y-5">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-[11px] font-bold tracking-[0.25em] uppercase mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          {category.items.map((item, itemIndex) => (
            <div key={item.name} className="flex items-stretch mb-2 bg-white border border-neutral-300">
              <div className="flex-1 px-3 py-2">
                <p className="font-bold text-sm uppercase"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-[11px] text-neutral-500"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
              <div className="w-16 bg-[#111] text-white flex items-center justify-center text-sm font-bold">
                <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  </div>
);

const Garden = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#f4f8f2] text-[#234033] px-5 py-7" style={{ fontFamily: "Lato, sans-serif" }}>
    <div className="text-center mb-6">
      <p className="text-emerald-700 text-xs tracking-[0.35em] uppercase">Seasonal</p>
      <h2 className="text-4xl text-emerald-900" style={{ fontFamily: "Cormorant Garamond, serif" }}><MenuTitle /></h2>
    </div>
    <div className="space-y-5">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex} className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
          <h3 className="text-emerald-800 font-semibold mb-3" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem" }}><CategoryTitle categoryIndex={categoryIndex} /></h3>
          {category.items.map((item, itemIndex) => (
            <div key={item.name} className="flex gap-3 py-2 border-s-2 border-emerald-400 ps-3 mb-2">
              <div className="flex-1">
                <p className="font-semibold text-sm"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-xs text-emerald-900/60"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
              <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency className="text-emerald-800 font-bold text-sm" />
            </div>
          ))}
        </section>
      ))}
    </div>
  </div>
);

const Bistrot = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fbf7f0] text-[#1c1c1c] px-6 py-8" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <div className="border border-black px-5 py-7">
      <p className="text-center text-[10px] tracking-[0.5em]">CARTE</p>
      <h2 className="text-center text-4xl mt-1" style={{ fontFamily: "Cormorant Garamond, serif" }}><MenuTitle /></h2>
      <div className="h-0.5 bg-[#b42318] w-12 mx-auto my-3" />
      <div className="space-y-7">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-center italic text-lg mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <Leaders
                  key={item.name}
                  item={item}
                  categoryIndex={categoryIndex}
                  itemIndex={itemIndex}
                  nameClass="text-sm"
                  priceClass="text-sm text-[#b42318]"
                  descClass="text-[11px] text-neutral-500"
                  rule="border-black"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);

const ShelfTags = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-white text-slate-800 p-4" style={{ fontFamily: "Inter, sans-serif" }}>
    <div className="border-b-4 border-slate-800 pb-2 mb-4 flex justify-between items-end">
      <h2 className="text-2xl font-black uppercase"><MenuTitle /></h2>
      <span className="text-[10px] font-bold tracking-widest">PRICE LIST</span>
    </div>
    {categories.map((category, categoryIndex) => (
      <section key={categoryIndex} className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
        <div className="grid grid-cols-2 gap-2">
          {category.items.map((item, itemIndex) => (
            <div key={item.name} className="border-2 border-slate-800 p-2 min-h-[88px] flex flex-col justify-between">
              <div>
                <p className="font-bold text-xs leading-tight uppercase"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-[10px] text-slate-500 line-clamp-2"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
              <p className="text-xl font-black leading-none"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} /><span className="text-[10px] font-semibold ms-1"><CurrencyMark /></span></p>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const Market = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fffaf2]" style={{ fontFamily: "Open Sans, sans-serif" }}>
    <div className="bg-[#166534] text-white px-5 py-5">
      <p className="text-[10px] tracking-[0.3em] uppercase text-green-100">Today's market</p>
      <h2 className="text-3xl font-bold"><MenuTitle /></h2>
    </div>
    <div className="p-4 space-y-5">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-green-800 font-bold text-sm uppercase mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          {category.items.map((item, itemIndex) => (
            <div key={item.name} className="flex items-center gap-3 bg-white rounded-full border border-green-200 px-3 py-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-green-950"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-[11px] text-green-900/60 truncate"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  </div>
);

const PriceSheet = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#f8fafc] text-slate-800 p-4" style={{ fontFamily: "Roboto, sans-serif" }}>
    <h2 className="text-xl font-bold"><MenuTitle /></h2>
    <p className="text-[11px] text-slate-500 mb-3 uppercase tracking-widest">Official price sheet</p>
    {categories.map((category, categoryIndex) => (
      <section key={categoryIndex} className="mb-4">
        <table className="w-full text-xs border border-slate-300 bg-white">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-start font-semibold px-2 py-2" colSpan={2}><CategoryTitle categoryIndex={categoryIndex} /></th>
              <th className="text-end font-semibold px-2 py-2 w-20"><CurrencyMark /></th>
            </tr>
          </thead>
          <tbody>
            {category.items.map((item, itemIndex) => (
              <tr key={item.name} className={itemIndex % 2 ? "bg-slate-50" : ""}>
                <td className="px-2 py-2 font-medium align-top"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></td>
                <td className="px-2 py-2 text-slate-500 align-top"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></td>
                <td className="px-2 py-2 text-end font-bold align-top"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ))}
  </div>
);

const Patisserie = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fff0f5] text-[#7a2948] px-4 py-6" style={{ fontFamily: "Lato, sans-serif" }}>
    <div className="text-center mb-5">
      <p className="text-[10px] tracking-[0.4em] uppercase">Pâtisserie</p>
      <h2 className="text-4xl" style={{ fontFamily: "Cormorant Garamond, serif" }}><MenuTitle /></h2>
    </div>
    <div className="space-y-5">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-center text-sm font-bold uppercase tracking-widest mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <div className="grid grid-cols-1 gap-3">
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="bg-white rounded-[1.6rem] px-4 py-3 text-center shadow-sm border border-pink-100">
                <p className="font-semibold"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-[11px] text-pink-400 mt-0.5"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
                <div className="mt-2 inline-flex w-12 h-12 rounded-full bg-pink-500 text-white items-center justify-center text-xs font-bold">
                  <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const KraftBakery = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#d7b48a] text-[#3b2412] p-5" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <div className="border-2 border-dashed border-[#3b2412] p-5">
      <p className="text-center text-[10px] tracking-[0.4em] uppercase">Baked this morning</p>
      <h2 className="text-center text-3xl mt-1"><MenuTitle /></h2>
      <div className="mt-5 space-y-5">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="uppercase text-xs tracking-[0.2em] font-bold mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="flex justify-between gap-2 py-1 border-b border-[#3b2412]/30 text-sm">
                <span><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></span>
                <span className="font-bold"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

const CakeCard = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-white text-[#3d3558] px-6 py-8" style={{ fontFamily: "Cormorant Garamond, serif" }}>
    <div className="border border-[#c4b5fd] p-6">
      <h2 className="text-center text-4xl"><MenuTitle /></h2>
      <p className="text-center text-xs tracking-[0.35em] uppercase text-[#8b7cc4] mt-1">Maison</p>
      <div className="mt-6 space-y-6">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-center text-sm tracking-[0.3em] uppercase text-[#8b7cc4] mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="text-center mb-4">
                <p className="text-xl"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                {item.description && <p className="text-xs text-[#8d86a3]" style={{ fontFamily: "Lato, sans-serif" }}><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
                <p className="text-sm text-[#6d5bd0] mt-1"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

const Speakeasy = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#0b1220] text-[#f6e7c1] px-6 py-8" style={{ fontFamily: "Cormorant Garamond, serif" }}>
    <div className="border border-[#c6a15b] px-5 py-7">
      <div className="border border-[#c6a15b]/40 px-4 py-6 text-center">
        <p className="text-[10px] tracking-[0.5em] uppercase text-[#c6a15b]">Lounge</p>
        <h2 className="text-4xl mt-1"><MenuTitle /></h2>
      </div>
      <div className="mt-6 space-y-6">
        {categories.map((category, categoryIndex) => (
          <section key={categoryIndex}>
            <h3 className="text-center text-xs tracking-[0.4em] uppercase text-[#c6a15b] mb-3"><CategoryTitle categoryIndex={categoryIndex} /></h3>
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="mb-4 text-center">
                <div className="flex items-baseline justify-center gap-3">
                  <p className="text-xl tracking-wide"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                  <span className="text-sm text-[#c6a15b]"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
                </div>
                {item.description && <p className="text-[11px] text-[#d9c89a]/70" style={{ fontFamily: "Inter, sans-serif" }}><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  </div>
);

const WineList = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#f7f3ea] text-[#3a2a24] px-5 py-7" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <h2 className="text-center text-3xl"><MenuTitle /></h2>
    <p className="text-center text-[10px] tracking-[0.4em] uppercase text-[#8c3a3a] mt-1 mb-6">Wine list</p>
    {categories.map((category, categoryIndex) => (
      <section key={categoryIndex} className="mb-6">
        <div className="grid grid-cols-[1fr_auto] text-[10px] uppercase tracking-widest text-[#8c3a3a] border-b border-[#8c3a3a] pb-1 mb-2">
          <span><CategoryTitle categoryIndex={categoryIndex} /></span>
          <span>Bottle</span>
        </div>
        {category.items.map((item, itemIndex) => (
          <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 py-1.5 text-sm">
            <div>
              <p><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
              {item.description && <p className="text-[11px] italic text-[#7d685c]"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
            </div>
            <span className="font-semibold"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
          </div>
        ))}
      </section>
    ))}
  </div>
);

const SportsBoard = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#10233f] text-white p-4" style={{ fontFamily: "Roboto, sans-serif" }}>
    <div className="bg-[#f5c518] text-[#10233f] text-center py-3 mb-4">
      <p className="text-[10px] font-black tracking-[0.35em]">GAME DAY</p>
      <h2 className="text-3xl font-black uppercase leading-none"><MenuTitle /></h2>
    </div>
    {categories.map((category, categoryIndex) => (
      <section key={categoryIndex} className="mb-4">
        <h3 className="text-[#f5c518] font-black text-xs tracking-[0.25em] uppercase mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
        {category.items.map((item, itemIndex) => (
          <div key={item.name} className="flex items-center gap-3 border-b border-white/10 py-2">
            <span className="w-7 text-[#f5c518] font-black">{String(itemIndex + 1).padStart(2, "0")}</span>
            <div className="flex-1">
              <p className="font-bold uppercase text-sm"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
              {item.description && <p className="text-[11px] text-white/60"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
            </div>
            <span className="text-[#f5c518] font-black text-lg"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
          </div>
        ))}
      </section>
    ))}
  </div>
);

const ComboBoard = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fff7ed]" style={{ fontFamily: "Montserrat, sans-serif" }}>
    <div className="bg-[#e11d2e] text-white px-5 py-5">
      <p className="text-[10px] font-bold tracking-[0.35em]">ORDER HERE</p>
      <h2 className="text-3xl font-black uppercase"><MenuTitle /></h2>
    </div>
    <div className="p-4 space-y-4">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="font-black uppercase text-sm text-[#e11d2e] mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <div className="grid grid-cols-1 gap-2">
            {category.items.map((item, itemIndex) => (
              <div key={item.name} className="bg-white border-2 border-[#111] rounded-xl p-3 flex items-center gap-3 shadow-[3px_3px_0_#111]">
                <div className="flex-1">
                  <p className="font-black uppercase text-sm"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>
                  {item.description && <p className="text-[11px] text-neutral-500"><ItemDesc categoryIndex={categoryIndex} itemIndex={itemIndex} /></p>}
                </div>
                <div className="bg-[#f5c518] border-2 border-[#111] rounded-lg px-2 py-1 font-black text-sm">
                  <ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const StreetStall = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#ff8a1e] text-[#1a1208] p-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
    <div className="bg-[#1a1208] text-[#ffd23f] text-center py-4 mb-3">
      <h2 className="text-3xl font-black uppercase"><MenuTitle /></h2>
      <p className="text-[10px] tracking-[0.3em]">STREET MENU</p>
    </div>
    {categories.map((category, categoryIndex) => (
      <section key={categoryIndex} className="mb-3 bg-[#fff4e0] p-3">
        <h3 className="font-black uppercase text-xs mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
        {category.items.map((item, itemIndex) => (
          <div key={item.name} className="flex justify-between items-center gap-2 py-1.5 border-b border-[#1a1208]/20">
            <span className="font-bold uppercase text-sm"><ItemName categoryIndex={categoryIndex} itemIndex={itemIndex} /></span>
            <span className="bg-[#1a1208] text-[#ffd23f] px-2 py-0.5 text-xs font-black"><ItemPrice categoryIndex={categoryIndex} itemIndex={itemIndex} withCurrency /></span>
          </div>
        ))}
      </section>
    ))}
  </div>
);

const Pizzeria = ({ name, categories }: RealMenuDesignProps) => (
  <div className="min-h-full bg-[#fffaf3] text-[#2b1d14]" style={{ fontFamily: "Libre Baskerville, serif" }}>
    <div className="h-2 bg-[#009246]" />
    <div className="h-2 bg-white" />
    <div className="h-2 bg-[#ce2b37]" />
    <div className="px-6 py-6 text-center">
      <p className="text-[10px] tracking-[0.45em] text-[#ce2b37]">PIZZERIA</p>
      <h2 className="text-4xl mt-1" style={{ fontFamily: "Cormorant Garamond, serif" }}><MenuTitle /></h2>
    </div>
    <div className="px-5 pb-6 space-y-6">
      {categories.map((category, categoryIndex) => (
        <section key={categoryIndex}>
          <h3 className="text-center text-[#009246] italic text-lg mb-2"><CategoryTitle categoryIndex={categoryIndex} /></h3>
          <div className="space-y-2">
            {category.items.map((item, itemIndex) => (
              <Leaders
                key={item.name}
                item={item}
                  categoryIndex={categoryIndex}
                  itemIndex={itemIndex}
                nameClass="text-sm"
                priceClass="text-sm text-[#ce2b37]"
                descClass="text-[11px] text-[#6b5344] italic"
                rule="border-[#ce2b37]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const RENDERERS: Record<MenuLayout, (props: RealMenuDesignProps) => JSX.Element> = {
  "fine-print": FinePrint,
  bistro: Bistro,
  levantine: Levantine,
  harbor: Harbor,
  tavern: Tavern,
  tasting: Tasting,
  chalkboard: Chalkboard,
  "brew-board": BrewBoard,
  garden: Garden,
  bistrot: Bistrot,
  "shelf-tags": ShelfTags,
  market: Market,
  "price-sheet": PriceSheet,
  patisserie: Patisserie,
  "kraft-bakery": KraftBakery,
  "cake-card": CakeCard,
  speakeasy: Speakeasy,
  "wine-list": WineList,
  "sports-board": SportsBoard,
  "combo-board": ComboBoard,
  "street-stall": StreetStall,
  pizzeria: Pizzeria,
};

const RealMenuDesign = ({
  layout,
  name,
  categories,
  vendorName,
  vendorLogo,
  compact,
  dir = "ltr",
  currency = "EGP",
  titleStyle,
  vendorStyle,
  onTextChange,
  onTextSelect,
}: RealMenuDesignProps) => {
  const resolved = isLayout(layout) ? layout : "fine-print";
  const Renderer = RENDERERS[resolved];
  const shown = sliceCategories(categories, compact);
  const showBrand = Boolean(vendorLogo || vendorName);

  return (
    <MenuEditContext.Provider value={{ name, vendorName, categories: shown, currency, titleStyle, vendorStyle, onChange: onTextChange, onSelect: onTextSelect }}>
      <div dir={dir} className={`relative h-full ${dir === "rtl" ? "[&_*]:![font-family:Cairo,sans-serif]" : ""}`}>
        {showBrand && (
          <div className="absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-1 px-6">
            {vendorLogo && (
              <img
                src={vendorLogo}
                alt={vendorName || name || "Logo"}
                className="h-16 w-16 rounded-full bg-white object-contain p-1 shadow-md"
              />
            )}
            {vendorName && <VendorTitle />}
          </div>
        )}
        <div className={showBrand ? "[&>div]:!pt-28" : undefined}>
          <Renderer layout={resolved} name={name} categories={shown} vendorName={vendorName} compact={compact} dir={dir} />
        </div>
      </div>
    </MenuEditContext.Provider>
  );
};

export default RealMenuDesign;
