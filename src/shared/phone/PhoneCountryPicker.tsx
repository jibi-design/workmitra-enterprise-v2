/**
 * Job Mitra | PhoneCountryPicker.tsx
 * Searchable dial-code picker — popular pins + full A–Z list.
 */

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  filterPhoneDialCountries,
  getPhoneDialCountry,
  getPopularPhoneDialCountries,
  type PhoneDialCountry,
} from "./phoneDialCountries";

type Props = {
  valueIso: string;
  disabled?: boolean;
  className?: string;
  testId?: string;
  onSelect: (iso: string) => void;
};

export function PhoneCountryPicker({
  valueIso,
  disabled = false,
  className = "wm-input",
  testId = "phone-country-picker",
  onSelect,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => getPhoneDialCountry(valueIso), [valueIso]);

  const popular = useMemo(() => getPopularPhoneDialCountries(), []);
  const filtered = useMemo(() => filterPhoneDialCountries(query), [query]);
  const popularIsos = useMemo(() => new Set(popular.map((c) => c.iso)), [popular]);
  const rest = useMemo(
    () => (query.trim() ? filtered : filtered.filter((c) => !popularIsos.has(c.iso))),
    [filtered, popularIsos, query],
  );
  const showPopular = !query.trim();

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(c: PhoneDialCountry) {
    onSelect(c.iso);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }} data-testid={testId}>
      <button
        type="button"
        className={className}
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        data-testid={`${testId}-trigger`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          fontWeight: 700,
          paddingInline: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span>
          {selected?.flag} {selected?.dial}
        </span>
        <span aria-hidden style={{ opacity: 0.55, fontSize: 10 }}>
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Select country dial code"
          data-testid={`${testId}-panel`}
          style={{
            position: "absolute",
            zIndex: 40,
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: 280,
            maxWidth: "min(360px, 92vw)",
            maxHeight: 320,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "#fff",
            boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
          }}
        >
          <div style={{ padding: 8, borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
            <input
              ref={searchRef}
              className={className}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country, ISO, or +code"
              aria-label="Search countries"
              data-testid={`${testId}-search`}
              autoComplete="off"
              style={{ width: "100%", fontWeight: 600 }}
            />
          </div>
          <div style={{ overflowY: "auto", padding: "4px 0" }}>
            {showPopular ? (
              <>
                <div style={sectionLabelStyle}>Popular</div>
                {popular.map((c) => (
                  <CountryRow
                    key={`pop-${c.iso}`}
                    country={c}
                    selected={c.iso === valueIso}
                    onPick={pick}
                  />
                ))}
                <div style={sectionLabelStyle}>All countries</div>
              </>
            ) : null}
            {rest.length === 0 ? (
              <div
                className="wm-ent-empty"
                role="status"
                style={{ padding: "16px 12px", fontSize: 12, color: "#64748b", fontWeight: 650 }}
              >
                No countries match “{query.trim()}”.
              </div>
            ) : (
              rest.map((c) => (
                <CountryRow key={c.iso} country={c} selected={c.iso === valueIso} onPick={pick} />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const sectionLabelStyle: CSSProperties = {
  padding: "8px 12px 4px",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#64748b",
};

function CountryRow({
  country,
  selected,
  onPick,
}: {
  country: PhoneDialCountry;
  selected: boolean;
  onPick: (c: PhoneDialCountry) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-testid={`phone-country-option-${country.iso}`}
      onClick={() => onPick(country)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        border: "none",
        background: selected ? "rgba(22,163,74,0.08)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontWeight: 650,
        fontSize: 13,
        color: "#0f172a",
      }}
    >
      <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
        {country.flag}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 750 }}>{country.name}</span>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 650 }}>
          {country.iso} · {country.dial}
        </span>
      </span>
    </button>
  );
}
