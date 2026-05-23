import {
  clampLiveSpectrumPeakHoldSec,
  clampReleaseDbPerSec,
  emaDecayFromReleaseDbPerSec,
  migrateSmoothingPctToReleaseDbPerSec,
  peakFallDbPerFrameFromRelease,
  resolveReleaseDbPerSec,
  scatterAlphaDecayFromReleaseDbPerSec,
} from "./liveBallistics";

describe("liveBallistics", () => {
  test("clampReleaseDbPerSec snaps to 0.5 dB/s steps", () => {
    expect(clampReleaseDbPerSec(7.3)).toBe(7.5);
    expect(clampReleaseDbPerSec(0.1)).toBe(0.5);
    expect(clampReleaseDbPerSec(99)).toBe(36);
  });

  test("migrateSmoothingPctToReleaseDbPerSec maps 0 to fast and 100 to slow", () => {
    expect(migrateSmoothingPctToReleaseDbPerSec(0)).toBe(36);
    expect(migrateSmoothingPctToReleaseDbPerSec(100)).toBe(0.5);
    expect(migrateSmoothingPctToReleaseDbPerSec(35)).toBeCloseTo(8, 0);
  });

  test("resolveReleaseDbPerSec prefers explicit dB/s over legacy pct", () => {
    expect(resolveReleaseDbPerSec(12, 0)).toBe(12);
    expect(resolveReleaseDbPerSec(undefined, 100)).toBe(0.5);
  });

  test("slow release yields higher EMA decay coefficient", () => {
    const fast = emaDecayFromReleaseDbPerSec(36);
    const slow = emaDecayFromReleaseDbPerSec(0.5);
    expect(slow).toBeGreaterThan(fast);
    expect(slow).toBeGreaterThan(0.998);
  });

  test("peakFallDbPerFrameFromRelease divides dB/s by frame rate", () => {
    expect(peakFallDbPerFrameFromRelease(36)).toBe(0.6);
    expect(peakFallDbPerFrameFromRelease(6)).toBe(0.1);
  });

  test("clampLiveSpectrumPeakHoldSec snaps to 0.05 s steps and range", () => {
    expect(clampLiveSpectrumPeakHoldSec(1.525)).toBe(1.55);
    expect(clampLiveSpectrumPeakHoldSec(-1)).toBe(0);
    expect(clampLiveSpectrumPeakHoldSec(99)).toBe(3);
    expect(clampLiveSpectrumPeakHoldSec(NaN)).toBe(0);
  });

  test("scatterAlphaDecay matches amplitude-equivalent release", () => {
    const decay = scatterAlphaDecayFromReleaseDbPerSec(12);
    expect(decay).toBeCloseTo(Math.pow(10, -12 / 1200), 6);
  });
});
