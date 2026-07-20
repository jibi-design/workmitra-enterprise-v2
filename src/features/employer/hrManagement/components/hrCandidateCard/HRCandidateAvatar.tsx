// App: Job Mitra / WorkMitra_Enterprise_v2
// File: HRCandidateAvatar.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\hrCandidateCard\HRCandidateAvatar.tsx

type Props = {
  initials: string;
  colors: {
    bg: string;
    color: string;
  };
};

export function HRCandidateAvatar({ initials, colors }: Props) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 12,
        color: colors.color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
