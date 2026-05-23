/** Live meter / spectrum ballistics in dB/s (release rate when level falls). */

export const LIVE_RELEASE_DBPS_MIN = 0.5;
export const LIVE_RELEASE_DBPS_MAX = 36;
export const LIVE_RELEASE_DBPS_DEFAULT = 8;
export const LIVE_FRAME_RATE = 60;

export function clampReleaseDbPerSec(value: number): number {
  const v = Number(value);
  if (!Number.isFinite(v)) return LIVE_RELEASE_DBPS_DEFAULT;
  const clamped = Math.max(
    LIVE_RELEASE_DBPS_MIN,
    Math.min(LIVE_RELEASE_DBPS_MAX, v),
  );
  return Math.round(clamped * 2) / 2;
}

/**
 * Map legacy 0–100 smoothing pct to release dB/s (0 = fast, 100 = slow).
 * Log-spaced between {@link LIVE_RELEASE_DBPS_MAX} and {@link LIVE_RELEASE_DBPS_MIN}.
 */
export function migrateSmoothingPctToReleaseDbPerSec(pct: number): number {
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const logMin = Math.log(LIVE_RELEASE_DBPS_MIN);
  const logMax = Math.log(LIVE_RELEASE_DBPS_MAX);
  return clampReleaseDbPerSec(Math.exp(logMax + (logMin - logMax) * t));
}

/**
 * Resolve stored release dB/s from new field or legacy pct cache keys.
 */
export function resolveReleaseDbPerSec(
  releaseDbPerSec: number | undefined,
  legacyPct: number | undefined,
  fallbackPct = 35,
): number {
  if (releaseDbPerSec !== undefined && Number.isFinite(releaseDbPerSec)) {
    return clampReleaseDbPerSec(releaseDbPerSec);
  }
  return migrateSmoothingPctToReleaseDbPerSec(legacyPct ?? fallbackPct);
}

/** EMA coefficient per frame for amplitude ballistics at given release rate. */
export function emaDecayFromReleaseDbPerSec(
  releaseDbPerSec: number,
  fps = LIVE_FRAME_RATE,
): number {
  const R = clampReleaseDbPerSec(releaseDbPerSec);
  const tau = 20 / (Math.LN10 * R);
  return Math.exp(-1 / (fps * tau));
}

/** Peak envelope fall in dB per animation frame. */
export function peakFallDbPerFrameFromRelease(
  releaseDbPerSec: number,
  fps = LIVE_FRAME_RATE,
): number {
  return clampReleaseDbPerSec(releaseDbPerSec) / fps;
}

/** Peak outline hold before dB/s decay, live spectrum (seconds). */
export const LIVE_SPECTRUM_PEAK_HOLD_SEC_MIN = 0;
export const LIVE_SPECTRUM_PEAK_HOLD_SEC_MAX = 3;

export function clampLiveSpectrumPeakHoldSec(value: number): number {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;
  const clamped = Math.max(
    LIVE_SPECTRUM_PEAK_HOLD_SEC_MIN,
    Math.min(LIVE_SPECTRUM_PEAK_HOLD_SEC_MAX, v),
  );
  return Math.round(clamped * 20) / 20;
}

/** Scatter / trail alpha multiplier per frame (amplitude-equivalent release). */
export function scatterAlphaDecayFromReleaseDbPerSec(
  releaseDbPerSec: number,
  fps = LIVE_FRAME_RATE,
): number {
  const R = clampReleaseDbPerSec(releaseDbPerSec);
  return Math.pow(10, -R / (20 * fps));
}

/** Overlay alpha for offscreen acc fade (1 − per-frame scatter decay). */
export function scatterFadeOverlayAlphaFromReleaseDbPerSec(
  releaseDbPerSec: number,
  fps = LIVE_FRAME_RATE,
): number {
  return 1 - scatterAlphaDecayFromReleaseDbPerSec(releaseDbPerSec, fps);
}

export function formatReleaseDbPerSecLabel(dbPerSec: number): string {
  return `${clampReleaseDbPerSec(dbPerSec).toFixed(1)} dB/s`;
}
