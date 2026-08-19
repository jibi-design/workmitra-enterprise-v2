/** Pass creation — quick validity window presets. */

import {
  PASS_DURATION_PRESETS,
  type PassDurationPresetId,
} from "../helpers/mitraLabsPassWindow.helpers";

type Props = {
  readonly activePreset?: PassDurationPresetId;
  readonly onApply: (presetId: PassDurationPresetId) => void;
};

export function DigitalInvitePassWindowPresets({ activePreset, onApply }: Props) {
  return (
    <div className="wm-mlPassWindowPresets" data-testid="pass-window-presets">
      <div className="wm-label">Pass duration</div>
      <div className="wm-mlSeg">
        {PASS_DURATION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`wm-mlSeg__btn${activePreset === preset.id ? " isOn" : ""}`}
            onClick={() => onApply(preset.id)}
            data-testid={`pass-preset-${preset.id}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p className="wm-mlListItem__meta">
        {PASS_DURATION_PRESETS.find((p) => p.id === activePreset)?.detail ??
          "Pick a preset, then fine-tune Valid from / Valid until below."}
      </p>
    </div>
  );
}
