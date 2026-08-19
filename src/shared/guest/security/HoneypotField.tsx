/** Hidden field — bots fill it; humans never see it. */

import { HONEYPOT_FIELD_NAME } from "./honeypotField.helpers";

export function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      className="wm-guest-honeypot"
      style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
    >
      <label>
        Company website
        <input
          type="text"
          name={HONEYPOT_FIELD_NAME}
          autoComplete="off"
          tabIndex={-1}
          defaultValue=""
          data-lpignore="true"
        />
      </label>
    </div>
  );
}
