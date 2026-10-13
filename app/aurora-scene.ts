export type Pose = {
  pitch: number;
  yaw: number;
  roll: number;
  spread: number;
  height: number;
  thickness: number;
  x: number;
  y: number;
  scale: number;
  fold: number;
  drop: number;
  opacity: number;
};
export type View = { width: number; height: number };
// hero: height of the pinned opening; end: last scroll position; skyline: the
// line (in clip-space y, at the end of the page) the closing curtain rests on.
export type Landmarks = { hero: number; end: number; skyline: number };

const clamp = (x: number, low = 0, high = 1) =>
  Math.max(low, Math.min(high, x));
export const ease = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const smooth = (from: number, to: number, x: number) =>
  ease((x - from) / (to - from));
const poseKeys = (pose: Pose) => Object.keys(pose) as Array<keyof Pose>;
const mixPose = (a: Pose, b: Pose, t: number): Pose =>
  Object.fromEntries(
    poseKeys(a).map((key) => [key, a[key] + (b[key] - a[key]) * ease(t)]),
  ) as Pose;

export const TALL: Pose = {
  pitch: -0.16,
  yaw: -0.5,
  roll: -0.17,
  spread: 0.8,
  height: 1.5,
  thickness: 1,
  x: 0,
  y: 0.21,
  scale: 1.12,
  fold: 0.15,
  drop: 0.31,
  opacity: 1,
};
export const FACE: Pose = {
  ...TALL,
  pitch: 0.35,
  yaw: 0.3,
  roll: 0.08,
  spread: 1.12,
  height: 1.15,
  x: 0.04,
  scale: 1.3,
  fold: 0.55,
};
export const FLAT: Pose = {
  ...TALL,
  pitch: 1.51,
  yaw: -0.06,
  roll: -0.035,
  spread: 2.15,
  height: 0.9,
  thickness: 0.28,
  x: 0,
  y: 0.02,
  scale: 1.25,
  fold: 0.3,
  drop: 0,
};
export const HORIZON: Pose = {
  ...FLAT,
  spread: 2.5,
  y: 0.42,
  scale: 1.1,
  opacity: 0.65,
};

// Where each pose sits along the pinned opening (0 = top of page, 1 = release).
const OPENING: Array<[number, Pose]> = [
  [0, TALL],
  [0.34, FACE],
  [0.8, FLAT],
  [1, HORIZON],
];
// The light is far away: it travels at a fraction of the page's speed.
const DEPTH = 0.55;
const EXIT = 1;
const ENTER = 1.2;
// Clip-space size of one ribbon unit at the scene's depth origin.
const PROJECTION = 2.3 / 4.8;
const BASE_DIP = 1.3;
const RAY_REACH = 1.5;

// Monotone cubic through the keys: every pose is reached exactly, nothing
// overshoots, and the motion never stalls between keys while scroll continues.
function track(times: number[], values: number[], t: number) {
  const last = times.length - 1;
  if (t <= times[0]) return values[0];
  if (t >= times[last]) return values[last];
  const slope = (i: number) =>
    (values[i + 1] - values[i]) / (times[i + 1] - times[i]);
  const tangent = (i: number) => {
    if (i === 0) return slope(0);
    if (i === last) return slope(last - 1);
    const a = slope(i - 1),
      b = slope(i);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  let i = 0;
  while (t >= times[i + 1]) i++;
  const span = times[i + 1] - times[i],
    s = (t - times[i]) / span;
  return (
    (2 * s * s * s - 3 * s * s + 1) * values[i] +
    (s * s * s - 2 * s * s + s) * span * tangent(i) +
    (-2 * s * s * s + 3 * s * s) * values[i + 1] +
    (s * s * s - s * s) * span * tangent(i + 1)
  );
}
const opening = (t: number): Pose => {
  const times = OPENING.map(([time]) => time);
  return Object.fromEntries(
    poseKeys(TALL).map((key) => [
      key,
      track(
        times,
        OPENING.map(([, pose]) => pose[key]),
        t,
      ),
    ]),
  ) as Pose;
};

const aspectOf = (view: View) => view.width / Math.max(1, view.height);
// Upright curtains are fitted to narrow screens by height, flat ones by width.
const sceneFit = (aspect: number, pitch: number) => {
  const flat = smooth(0.6, 1.4, Math.abs(pitch));
  return (
    Math.min(1, aspect * 1.65) * (1 - flat) + Math.min(1, aspect * 0.8) * flat
  );
};
// Resolves a pose for a viewport: narrow screens centre the curtain and lower
// it beneath the hero copy; `shift` is the scroll-driven vertical travel.
const place = (pose: Pose, view: View, shift = 0): Pose => {
  const aspect = aspectOf(view),
    narrow = 1 - smooth(0.7, 1.2, aspect);
  // Edge-on, a phone's narrow frame leaves only a faint thread: there the
  // curtain tips back toward the viewer, grows, and brightens.
  const thread = narrow * smooth(0.6, 1.4, Math.abs(pose.pitch));
  return {
    ...pose,
    pitch: pose.pitch - Math.sign(pose.pitch) * thread * 0.24,
    x: pose.x * (1 - narrow * 0.9),
    y: pose.y - narrow * pose.drop + shift,
    scale: pose.scale * sceneFit(aspect, pose.pitch) * (1 + thread * 0.45),
    opacity: Math.min(1, pose.opacity * (1 + thread * 0.5)),
  };
};

// The closing curtain: upright again, as wide as the viewport, with its lower
// edge resting just above the footer's call to action.
export function finalePose(view: View, skyline: number): Pose {
  const aspect = aspectOf(view),
    pitch = 0.24,
    scale = 1.15,
    unit = PROJECTION * scale * sceneFit(aspect, pitch);
  const height = clamp(((1 - skyline) * 0.84) / (RAY_REACH * unit), 0.62, 1.55);
  return {
    pitch,
    yaw: 0.05,
    roll: 0.02,
    spread: clamp((1.12 * aspect) / (1.325 * unit), 1.6, 3.2),
    height,
    thickness: 1,
    x: 0,
    y: skyline + 0.05 + BASE_DIP * height * unit,
    scale,
    fold: 0.5,
    drop: 0,
    opacity: 1,
  };
}

export function samplePose(
  scroll: number,
  view: View,
  landmarks: Landmarks,
): Pose {
  const h = Math.max(1, view.height),
    pin = Math.max(1, landmarks.hero - h);
  if (scroll < pin) return place(opening(scroll / pin), view);
  const end = Math.max(pin + 2, landmarks.end),
    handoff = (pin + end) / 2;
  if (scroll < handoff) {
    // Released: the horizon rises away with the page and dissolves.
    const leaving = (scroll - pin) / Math.min(h * EXIT, handoff - pin);
    return place(
      { ...HORIZON, opacity: HORIZON.opacity * (1 - ease(leaving)) },
      view,
      ((scroll - pin) / h) * 2 * DEPTH,
    );
  }
  // Arriving: the same flat line comes up with the footer and stands upright.
  const finale = finalePose(view, landmarks.skyline),
    arriving = clamp(1 - (end - scroll) / Math.min(h * ENTER, end - handoff));
  const rising: Pose = {
    ...finale,
    pitch: 1.45,
    yaw: -0.06,
    height: finale.height * 0.8,
    thickness: 0.3,
    fold: 0.3,
    y: finale.y - 0.2,
  };
  return place(
    { ...mixPose(rising, finale, arriving), opacity: ease(arriving / 0.55) },
    view,
    (-Math.max(0, end - scroll) / h) * 2 * DEPTH,
  );
}

// Reduced motion: two still compositions instead of a scroll-driven journey.
export function restPose(
  scroll: number,
  view: View,
  landmarks: Landmarks,
): Pose {
  return place(
    scroll > landmarks.end - view.height * 0.4
      ? finalePose(view, landmarks.skyline)
      : TALL,
    view,
  );
}

// One continuous curtain per layer; `parameters` holds (along, up, layer).
export function createRibbonMesh(segments = 432, rows = 18, layers = 2) {
  const count = layers * (segments + 1) * (rows + 1);
  if (
    count > 65535 ||
    ![segments, rows, layers].every((n) => Number.isInteger(n) && n >= 1)
  )
    throw new Error('Unsupported ribbon mesh dimensions');
  const parameters = new Float32Array(count * 3);
  const indices = new Uint16Array(layers * segments * rows * 6);
  let vertex = 0,
    index = 0;
  for (let layer = 0; layer < layers; layer++) {
    const start = vertex;
    for (let u = 0; u <= segments; u++)
      for (let v = 0; v <= rows; v++)
        parameters.set([u / segments, v / rows, layer], vertex++ * 3);
    for (let u = 0; u < segments; u++)
      for (let v = 0; v < rows; v++) {
        const a = start + u * (rows + 1) + v,
          b = a + rows + 1;
        indices.set([a, b, a + 1, a + 1, b, b + 1], index);
        index += 6;
      }
  }
  return { parameters, indices, count };
}
