import { ANVIL, BEAK, BEAK_COLOR, BIRD, EYE, LEGS, WINGED } from './mark-paths';
import { ANVIL_BIRD_PATHS, ANVIL_BIRD_VIEWBOX } from './anvil-bird-paths';

type MarkProps = { className?: string; title?: string };

const frame = (title?: string) =>
  title
    ? ({ role: 'img', 'aria-label': title } as const)
    : ({ 'aria-hidden': true } as const);

// The wrapper measures the displayed width. A container query adds the
// compact outline below 64px, including before JavaScript loads.
export function AnvilBirdMark({ className = '', title }: MarkProps) {
  return (
    <span className={`anvil-bird-mark ${className}`.trim()}>
      <svg
        viewBox={ANVIL_BIRD_VIEWBOX}
        width="252"
        height="162"
        {...frame(title)}
      >
        <g className="anvil-bird-lines" fill="currentColor">
          {ANVIL_BIRD_PATHS.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
      </svg>
    </span>
  );
}

function Emblem({ ink }: { ink: string }) {
  return (
    <>
      <path d={ANVIL} fill={ink} />
      <path d={BIRD} fill={ink} />
      <path d={LEGS} stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
      <path d={BEAK} fill={BEAK_COLOR} />
      <circle {...EYE} fill="none" stroke={BEAK_COLOR} strokeWidth=".7" />
    </>
  );
}

// The blackbird, actually black: bird and anvil silhouetted against a pale
// disc, the anvil standing on the disc's lower edge.
export function Mark({ className = '', title }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" {...frame(title)}>
      <defs>
        <clipPath id="mark-disc">
          <circle cx="32" cy="32" r="31" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="31" fill="var(--mark-disc, currentColor)" />
      <g
        clipPath="url(#mark-disc)"
        transform="translate(32 32.6) scale(.74) translate(-32.2 -35.2)"
      >
        <Emblem ink="var(--mark-ink, #06100f)" />
      </g>
    </svg>
  );
}

// The same drawing with no disc, for light grounds or a reversed stamp.
export function MarkSilhouette({ className = '', title }: MarkProps) {
  return (
    <svg className={className} viewBox="0 6 64 58" {...frame(title)}>
      <Emblem ink="currentColor" />
    </svg>
  );
}

// One thin line, to sit beside light type.
export function MarkLine({ className = '', title }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 6 64 58"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      {...frame(title)}
    >
      <path d={ANVIL} />
      <path d={BIRD} />
      <path d={LEGS} />
      <path d={BEAK} fill={BEAK_COLOR} stroke={BEAK_COLOR} />
    </svg>
  );
}

// The anvil alone, read as the bird: its horn is the beak.
export function MarkHybrid({ className = '', title }: MarkProps) {
  return (
    <svg className={className} viewBox="0 15 64 64" {...frame(title)}>
      <path d={ANVIL} fill="currentColor" />
      <path
        d="M3 39.6C8 37.4 14 36 20 36V43.2C13.6 42.5 8 41.5 3 39.6Z"
        fill={BEAK_COLOR}
      />
      <circle cx="27.5" cy="40" r="1.3" fill="var(--mark-ground, #050c10)" />
    </svg>
  );
}

const beakTip = (
  <clipPath id="mark-tip">
    <rect x="0" y="36" width="11.5" height="12" />
  </clipPath>
);

// The winged anvil as a solid silhouette.
export function MarkWinged({ className = '', title }: MarkProps) {
  return (
    <svg className={className} viewBox="0 1 64 64" {...frame(title)}>
      <defs>{beakTip}</defs>
      <path d={WINGED} fill="currentColor" />
      <path d={WINGED} fill={BEAK_COLOR} clipPath="url(#mark-tip)" />
    </svg>
  );
}

// The same outline as a single pen line.
export function MarkWingedLine({ className = '', title }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 1 64 64"
      fill="none"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      {...frame(title)}
    >
      <defs>{beakTip}</defs>
      <path d={WINGED} stroke="currentColor" />
      <path d={WINGED} stroke={BEAK_COLOR} clipPath="url(#mark-tip)" />
    </svg>
  );
}

// The winged anvil in black against the pale disc.
export function MarkWingedDisc({ className = '', title }: MarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" {...frame(title)}>
      <defs>{beakTip}</defs>
      <circle cx="32" cy="32" r="31" fill="var(--mark-disc, currentColor)" />
      <g transform="translate(32 32) scale(.72) translate(-32.5 -33)">
        <path d={WINGED} fill="var(--mark-ink, #06100f)" />
        <path d={WINGED} fill={BEAK_COLOR} clipPath="url(#mark-tip)" />
      </g>
    </svg>
  );
}
