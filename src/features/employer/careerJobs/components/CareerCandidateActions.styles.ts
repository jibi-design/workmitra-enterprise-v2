export const CAREER_CANDIDATE_ACTIONS_STYLE = `
  .wm-act-btn {
    transition: all 0.2s var(--wm-motion-spring) !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    min-height: 44px;
    padding: 0 16px;
    border-radius: var(--wm-radius-button);
    white-space: nowrap;
    cursor: pointer;
  }
  .wm-act-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .wm-act-btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  
  .wm-act-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border: none;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
  .wm-act-primary:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  }
  
  .wm-act-ghost {
    background: transparent;
    color: #475569;
    border: 1px solid #cbd5e1;
  }
  .wm-act-ghost:hover:not(:disabled) {
    background: #f8fafc;
    color: #0f172a;
    border-color: #94a3b8;
  }

  .wm-act-danger {
    background: transparent;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  .wm-act-danger:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #f87171;
  }

  .wm-act-special {
    width: 100%;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f8fafc, #ffffff);
    color: #4338ca;
    border: 1px solid #e0e7ff;
    box-shadow: 0 2px 8px rgba(67, 56, 202, 0.05);
  }
  .wm-act-special:hover:not(:disabled) {
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(67, 56, 202, 0.1);
  }

  .wm-actions-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .wm-actions-left {
    display: flex;
    gap: 8px;
  }
  .wm-actions-right {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  @media (max-width: 640px) {
    .wm-actions-wrapper {
      flex-direction: column-reverse;
      align-items: stretch;
      gap: 12px;
    }
    .wm-actions-left {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }
    .wm-actions-right {
      display: flex;
      flex-direction: column-reverse;
      gap: 8px;
      width: 100%;
    }
    .wm-act-btn {
      width: 100%;
    }
  }
`;
