// src/features/employer/workforceOps/components/workforceIcons.tsx
//
// Shared SVG icons for Workforce Ops Hub.
// Used across employer and employee workforce pages.

export function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z" />
    </svg>
  );
}

export function IconStaff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

export function IconAnnounce() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M18 11v2h4v-2h-4Zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.49-.67 1-1.32 1.49-1.99-.99-.74-2.24-1.68-3.2-2.4-.49.67-1 1.33-1.49 2Zm4.8-14.01c-.49-.66-1-1.32-1.49-1.99-.99.74-2.24 1.68-3.2 2.4.49.66 1 1.32 1.49 1.99.96-.72 2.21-1.66 3.2-2.4ZM8 9H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9h3Zm5.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34Z" />
    </svg>
  );
}

export function IconGroup() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91ZM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29ZM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57ZM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3Z" />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" />
    </svg>
  );
}

export function IconCategory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2l-5.5 9h11L12 2Zm0 3.84L13.93 9h-3.87L12 5.84ZM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5Zm0 7a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5ZM3 21.5h8v-8H3v8Zm2-6h4v4H5v-4Z" />
    </svg>
  );
}

export function IconActivity() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18Zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />
    </svg>
  );
}

export function IconEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="var(--wm-er-muted)"
        opacity="0.3"
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
      />
    </svg>
  );
}

export function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
    </svg>
  );
}

export function IconFilter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

export function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82Z" />
    </svg>
  );
}

export function IconDelete() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
    </svg>
  );
}