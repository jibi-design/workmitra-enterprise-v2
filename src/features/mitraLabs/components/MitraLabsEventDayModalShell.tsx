/** Mitra Labs Event day — enterprise modal shell (confirmModal-grade). */

import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { CenterModal } from "../../../shared/components/CenterModal";
import "../../../app/theme/mitra-labs.css";

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly ariaLabel: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: LucideIcon;
  readonly tone?: "pin" | "scanner";
  readonly glass?: boolean;
  readonly testId?: string;
  readonly dataBuild?: string;
  readonly maxWidth?: number;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
};

export function MitraLabsEventDayModalShell({
  open,
  onClose,
  ariaLabel,
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  tone = "pin",
  glass = false,
  testId,
  dataBuild,
  maxWidth = 460,
  children,
  footer,
}: Props) {
  const rootClass = [
    "wm-mlEntModal",
    `wm-mlEntModal--${tone}`,
    glass ? "wm-mlEntModal--glass" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <CenterModal
      open={open}
      onBackdropClose={onClose}
      ariaLabel={ariaLabel}
      maxWidth={maxWidth}
      surface="bare"
    >
      <div className={rootClass} data-testid={testId} data-ui-build={dataBuild}>
        <button
          type="button"
          className="wm-mlEntModal__close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>

        {glass ? (
          <header className="wm-mlEntModal__headerGlass">
            <div className="wm-mlEntModal__brandRow">
              <div className="wm-mlEntModal__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2.25} />
              </div>
              <span className="wm-mlEntModal__eyebrow">{eyebrow}</span>
            </div>
            <h2 className="wm-mlEntModal__title">{title}</h2>
            <p className="wm-mlEntModal__sub">{subtitle}</p>
          </header>
        ) : (
          <div className="wm-mlEntModal__header">
            <div className="wm-mlEntModal__icon" aria-hidden="true">
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <div className="wm-mlEntModal__titleBlock">
              <div className="wm-mlEntModal__eyebrow">{eyebrow}</div>
              <h2 className="wm-mlEntModal__title">{title}</h2>
              <p className="wm-mlEntModal__sub">{subtitle}</p>
            </div>
          </div>
        )}

        <div className="wm-mlEntModal__body">{children}</div>

        {footer ? <div className="wm-mlEntModal__actions">{footer}</div> : null}
      </div>
    </CenterModal>
  );
}
