import { Label } from "@/components/ui/label";
import { MENU_FONTS } from "@/lib/textStyle";
import type { TextStyle } from "@/lib/menuStorage";

interface TextStyleFieldsProps {
  label?: string;
  value?: TextStyle;
  onChange: (style: TextStyle | undefined) => void;
}

const clean = (style: TextStyle): TextStyle | undefined => {
  const next: TextStyle = { ...style };
  (Object.keys(next) as (keyof TextStyle)[]).forEach((key) => {
    const field = next[key];
    if (field === undefined || field === "" || field === false || field === "none") {
      delete next[key];
    }
  });
  return Object.keys(next).length ? next : undefined;
};

const TextStyleFields = ({ label = "Text style", value, onChange }: TextStyleFieldsProps) => {
  const style = value ?? {};
  const patch = (partial: Partial<TextStyle>) => onChange(clean({ ...style, ...partial }));

  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onChange(undefined)}
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Label className="text-xs">Font family</Label>
          <select
            value={style.fontFamily ?? ""}
            onChange={(event) => patch({ fontFamily: event.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="">Template default</option>
            {MENU_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Weight</Label>
          <select
            value={style.fontWeight ?? ""}
            onChange={(event) => patch({ fontWeight: event.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="">Default</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
            <option value="800">Extra bold</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Size (px)</Label>
          <input
            type="number"
            min={8}
            max={96}
            value={style.fontSize ?? ""}
            placeholder="Auto"
            onChange={(event) => patch({ fontSize: event.target.value ? Number(event.target.value) : undefined })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Line height</Label>
          <input
            type="number"
            min={0.8}
            max={3}
            step={0.1}
            value={style.lineHeight ?? ""}
            placeholder="Auto"
            onChange={(event) => patch({ lineHeight: event.target.value ? Number(event.target.value) : undefined })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Letter spacing</Label>
          <input
            type="number"
            min={-2}
            max={20}
            step={0.5}
            value={style.letterSpacing ?? ""}
            placeholder="0"
            onChange={(event) => patch({ letterSpacing: event.target.value === "" ? undefined : Number(event.target.value) })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              aria-label="Text color"
              value={style.color ?? "#1a1a1a"}
              onChange={(event) => patch({ color: event.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-border bg-background"
            />
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => patch({ color: undefined })}
            >
              Default
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs">Transform</Label>
          <select
            value={style.transform ?? "none"}
            onChange={(event) => patch({ transform: event.target.value as TextStyle["transform"] })}
            className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          aria-pressed={Boolean(style.italic)}
          onClick={() => patch({ italic: !style.italic })}
          className={`h-8 rounded-md border px-2 text-xs italic ${style.italic ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
        >
          Italic
        </button>
        <button
          type="button"
          aria-pressed={Boolean(style.underline)}
          onClick={() => patch({ underline: !style.underline })}
          className={`h-8 rounded-md border px-2 text-xs underline ${style.underline ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
        >
          Underline
        </button>
        {(["left", "center", "right"] as const).map((align) => (
          <button
            key={align}
            type="button"
            aria-pressed={style.align === align}
            onClick={() => patch({ align: style.align === align ? undefined : align })}
            className={`h-8 rounded-md border px-2 text-xs capitalize ${style.align === align ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
          >
            {align}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextStyleFields;
