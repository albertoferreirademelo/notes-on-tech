import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createRibbonMesh,
  finalePose,
  restPose,
  samplePose,
  TALL,
  FACE,
  FLAT,
  HORIZON,
  type Pose,
} from '../app/aurora-scene.ts';

const view = { width: 1280, height: 800 };
const landmarks = { hero: 1680, end: 4200, skyline: 0.1 };
const pin = landmarks.hero - view.height;
const keys = Object.keys(TALL) as Array<keyof Pose>;
const close = (a: number, b: number, tolerance = 1e-9) =>
  Math.abs(a - b) < tolerance;

void test('the opening rotates upright curtains almost edge-on and doubles their spread', () => {
  assert.deepEqual(samplePose(0, view, landmarks), TALL);
  for (const [at, pose] of [
    [0.34, FACE],
    [0.8, FLAT],
  ] as const) {
    const sampled = samplePose(pin * at, view, landmarks);
    for (const key of keys)
      assert.ok(close(sampled[key], pose[key]), `${at}: ${key}`);
  }
  assert.ok(Math.cos(FLAT.pitch) < 0.09);
  assert.ok(FLAT.spread / TALL.spread > 2.4);
  assert.ok(FLAT.thickness / TALL.thickness < 0.4);
});

void test('the curtain keeps turning for as long as the opening is scrolled', () => {
  let previous = samplePose(0, view, landmarks);
  for (let step = 1; step <= 40; step++) {
    const pose = samplePose((pin * 0.8 * step) / 40, view, landmarks);
    assert.ok(pose.pitch > previous.pitch, `pitch stalled at step ${step}`);
    assert.ok(pose.pitch <= FLAT.pitch + 1e-9, 'pitch must not overshoot');
    assert.ok(pose.opacity <= 1 && pose.thickness <= 1);
    previous = pose;
  }
});

void test('the journey is continuous in both directions, including each handoff', () => {
  for (const marks of [landmarks, { ...landmarks, end: pin + 300 }]) {
    const handoff = (pin + marks.end) / 2;
    const anchors = [
      0,
      pin * 0.34,
      pin * 0.8,
      pin,
      pin + view.height,
      handoff,
      marks.end - view.height * 1.2,
      marks.end,
    ];
    for (const anchor of anchors) {
      const before = samplePose(anchor - 0.001, view, marks);
      const after = samplePose(anchor + 0.001, view, marks);
      // The light may change places only while it is fully dark.
      if (before.opacity < 1e-4 && after.opacity < 1e-4) continue;
      for (const key of keys)
        assert.ok(
          close(before[key], after[key], 1e-4),
          `${anchor}: ${key} must not jump`,
        );
    }
  }
});

void test('the horizon leaves upward with the page and the finale arrives from below', () => {
  const released = samplePose(pin, view, landmarks);
  assert.ok(close(released.y, HORIZON.y) && close(released.opacity, 0.65));
  let previous = released;
  for (let scroll = pin + 40; scroll <= pin + view.height; scroll += 40) {
    const pose = samplePose(scroll, view, landmarks);
    assert.ok(pose.y > previous.y && pose.opacity < previous.opacity);
    previous = pose;
  }
  assert.equal(previous.opacity, 0);

  const finale = samplePose(landmarks.end, view, landmarks);
  previous = samplePose(landmarks.end - view.height * 1.2, view, landmarks);
  assert.equal(previous.opacity, 0);
  for (let back = view.height * 1.2 - 40; back >= 0; back -= 40) {
    const pose = samplePose(landmarks.end - back, view, landmarks);
    assert.ok(pose.y > previous.y, 'the finale only ever rises into place');
    assert.ok(pose.opacity >= previous.opacity);
    previous = pose;
  }
  assert.deepEqual(previous, finale);
  assert.deepEqual(samplePose(landmarks.end + 80, view, landmarks), finale);
});

void test('the closing curtain stands upright above the footer text on every screen', () => {
  for (const [width, height] of [
    [1440, 900],
    [1366, 650],
    [2560, 1080],
    [390, 844],
    [375, 600],
  ])
    for (const skyline of [-0.2, 0.08, 0.4]) {
      const screen = { width, height };
      const pose = samplePose(5000, screen, {
        hero: height * 2.1,
        end: 5000,
        skyline,
      });
      assert.equal(pose.opacity, 1);
      assert.ok(Math.cos(pose.pitch) > 0.95, 'upright');
      assert.equal(pose.x, 0);
      // Lowest point of the curtain's lower edge, projected to clip space.
      const base = pose.y - 1.12 * pose.height * (2.3 / 4.8) * pose.scale;
      assert.ok(base > skyline, `${width}x${height} clears the skyline`);
      assert.deepEqual(
        restPose(5000, screen, { hero: 0, end: 5000, skyline }),
        pose,
      );
      assert.ok(finalePose(screen, skyline).spread >= 1.6);
    }
  assert.deepEqual(restPose(0, view, landmarks), TALL);
});

void test('on a phone the flat horizon tips toward the viewer and brightens', () => {
  const phone = { width: 390, height: 844 };
  const marks = { hero: 844 * 1.95, end: 5000, skyline: 0.1 };
  const release = marks.hero - phone.height;
  const narrow = samplePose(release, phone, marks);
  const wide = samplePose(pin, view, landmarks);
  assert.ok(narrow.pitch < wide.pitch - 0.2, 'less edge-on');
  assert.ok(narrow.opacity > wide.opacity + 0.2, 'brighter');
  let previous = samplePose(0, phone, marks);
  for (let step = 1; step <= 40; step++) {
    const pose = samplePose((release * 0.8 * step) / 40, phone, marks);
    assert.ok(pose.pitch > previous.pitch, 'still turns one way only');
    previous = pose;
  }
});

void test('scrolling across the entire page keeps all pose values finite and bounded', () => {
  for (const screen of [view, { width: 390, height: 844 }])
    for (let scroll = -100; scroll < 6000; scroll += 7) {
      const pose = samplePose(scroll, screen, landmarks);
      assert.ok(Object.values(pose).every(Number.isFinite));
      assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
      assert.ok(pose.scale > 0 && pose.height > 0 && pose.spread > 0);
    }
});

void test('each layer is one continuous curtain and triangles never bridge layers', () => {
  for (const [segments, rows, layers] of [
    [432, 18, 2],
    [1, 1, 1],
  ]) {
    const mesh = createRibbonMesh(segments, rows, layers);
    const stride = (segments + 1) * (rows + 1);
    assert.equal(mesh.count, layers * stride);
    assert.equal(mesh.parameters.length, mesh.count * 3);
    assert.equal(mesh.indices.length, layers * segments * rows * 6);
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const layer = Math.floor(mesh.indices[i] / stride);
      for (let j = 0; j < 3; j++) {
        assert.ok(mesh.indices[i + j] < mesh.count);
        assert.equal(Math.floor(mesh.indices[i + j] / stride), layer);
      }
    }
    for (let vertex = 0; vertex < mesh.count; vertex++) {
      const [along, up, layer] = mesh.parameters.subarray(
        vertex * 3,
        vertex * 3 + 3,
      );
      assert.ok(along >= 0 && along <= 1 && up >= 0 && up <= 1);
      assert.equal(layer, Math.floor(vertex / stride));
    }
  }
  for (const args of [
    [3000, 18, 2],
    [0, 18, 2],
    [4.5, 18, 2],
    [432, 18, 0],
  ])
    assert.throws(() =>
      createRibbonMesh(...(args as [number, number, number])),
    );
});
