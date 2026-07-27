import { getResultButtonStyle } from "./CareerResultFormModal.styles";

type ResultButtonProps = {
  label: string;
  selected: boolean;
  color: string;
  onClick: () => void;
};

export function ResultButton({ label, selected, color, onClick }: ResultButtonProps) {
  return (
    <button
      className={`wm-result-btn ${selected ? "selected" : ""}`}
      type="button"
      onClick={onClick}
      style={getResultButtonStyle(selected, color)}
    >
      {selected && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {label}
    </button>
  );
}
