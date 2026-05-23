import { LoudnessWorkletNode } from "loudness-worklet";

/** Webview URI for `dist/loudness.worklet.js` (set from extension CONFIG). */
let _moduleUrl: string | null = null;

const _loadedContexts = new WeakSet<BaseAudioContext>();

export function setLoudnessWorkletModuleUrl(url: string): void {
  _moduleUrl = url;
}

export function getLoudnessWorkletModuleUrl(): string | null {
  return _moduleUrl;
}

/**
 * Register the loudness AudioWorklet processor on `ctx`.
 * Prefers the extension-hosted worklet script (CSP-safe); falls back to the
 * library blob loader when no URL was configured (e.g. unit tests).
 */
export async function loadLoudnessWorkletModule(
  ctx: BaseAudioContext,
): Promise<void> {
  if (_loadedContexts.has(ctx)) {
    return;
  }
  if (_moduleUrl) {
    await ctx.audioWorklet.addModule(_moduleUrl);
  } else {
    await LoudnessWorkletNode.loadModule(ctx);
  }
  _loadedContexts.add(ctx);
}
