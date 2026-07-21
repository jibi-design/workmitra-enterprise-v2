/** Job Mitra | CommandPalette.tsx | Employer Cmd/Ctrl+K navigation overlay */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StatusBadge } from "./StatusBadge";
import {
  EMPLOYER_COMMAND_PALETTE_ITEMS,
  filterCommandPaletteItems,
  type CommandPaletteItem,
} from "./commandPalette.registry";
import type { EnterpriseTone } from "./enterprise.types";

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  testId?: string;
};

function domainTone(domain: CommandPaletteItem["domain"]): EnterpriseTone {
  if (domain === "planner") return "active";
  if (domain === "shift") return "active";
  if (domain === "career") return "pending";
  return "neutral";
}

function domainAccent(
  domain: CommandPaletteItem["domain"],
): "planner" | "shift" | "career" | undefined {
  if (domain === "general") return undefined;
  return domain;
}

export function CommandPalette({ open, onClose, onNavigate, testId }: CommandPaletteProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset search session when the palette opens (React-recommended prop→state adjust).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  const results = useMemo(
    () => filterCommandPaletteItems(query, EMPLOYER_COMMAND_PALETTE_ITEMS),
    [query],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        const item = results[activeIndex];
        if (!item) return;
        event.preventDefault();
        onNavigate(item.path);
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNavigate, results, activeIndex]);

  if (!open) return null;

  return createPortal(
    <div
      className="wm-ent-cmd-backdrop"
      role="presentation"
      data-testid={testId ?? "wm-ent-command-palette"}
      onClick={onClose}
    >
      <div
        className="wm-ent-cmd-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="wm-ent-command-palette-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wm-ent-cmd-header">
          <h2 id={titleId} className="wm-ent-cmd-title">
            Jump to
          </h2>
          <button
            type="button"
            className="wm-outlineBtn"
            onClick={onClose}
            data-testid="wm-ent-command-palette-close"
            aria-label="Close command palette"
          >
            Esc
          </button>
        </div>

        <label className="wm-ent-cmd-search">
          <span className="wm-ent-cmd-search-label">Search</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search Planner, Shift, Career…"
            className="wm-ent-cmd-input"
            data-testid="wm-ent-command-palette-input"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <ul className="wm-ent-cmd-list" role="listbox" aria-label="Commands">
          {results.length === 0 ? (
            <li className="wm-ent-cmd-empty" role="presentation">
              No matching destinations
            </li>
          ) : (
            results.map((item, index) => {
              const active = index === activeIndex;
              return (
                <li key={item.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={`wm-ent-cmd-item${active ? " is-active" : ""}`}
                    data-testid={`wm-ent-command-item-${item.id}`}
                    data-domain={item.domain}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose();
                    }}
                  >
                    <span className="wm-ent-cmd-item-main">
                      <span className="wm-ent-cmd-item-label">{item.label}</span>
                      <span className="wm-ent-cmd-item-group">{item.group}</span>
                    </span>
                    <StatusBadge
                      label={item.domain}
                      tone={domainTone(item.domain)}
                      accent={domainAccent(item.domain)}
                    />
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="wm-ent-cmd-footer">
          <span>↑↓ navigate</span>
          <span>Enter open</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
