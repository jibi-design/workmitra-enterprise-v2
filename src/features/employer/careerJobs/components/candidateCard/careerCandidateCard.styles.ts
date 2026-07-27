export const CANDIDATE_VISUALS = `
  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(10px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulseDot {
    0% { transform: scale(0.8); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0.8; }
  }
  .wm-candidate-card {
    animation: cardEntrance var(--wm-motion-slow) var(--wm-motion-spring) forwards;
    transition: all var(--wm-motion-base) var(--wm-motion-spring) !important;
    padding: 24px;
  }
  .wm-candidate-card:hover {
    box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1) !important;
  }
  .wm-candidate-name {
    font-size: 15px;
    font-weight: 700;
  }
  .wm-candidate-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: var(--wm-career-accent);
    background: var(--wm-career-accent-soft);
    border: 1px solid var(--wm-career-accent-border);
  }
  .wm-candidate-toggle-btn {
    transition: all var(--wm-motion-fast) var(--wm-motion-spring);
  }
  .wm-candidate-toggle-btn:hover {
    background: rgba(29, 78, 216, 0.04) !important;
  }
  .pulse-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulseDot 2s infinite ease-in-out;
  }

  .wm-horizontal-scroll {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }
  .wm-horizontal-scroll::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 640px) {
    .wm-candidate-card {
      padding: 16px !important;
      border-radius: var(--wm-radius-employee-card) !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wm-candidate-card,
    .wm-candidate-toggle-btn {
      animation: none !important;
      transition: none !important;
    }
    .pulse-dot {
      animation: none !important;
    }
  }
`;
