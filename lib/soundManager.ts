export type UISoundName =
  | "select"
  | "switch"
  | "open"
  | "close"
  | "back"
  | "confirm"
  | "cancel"
  | "reset"
  | "play"
  | "success"
  | "unavailable"
  | "door-locked"
  | "door-unlock"
  | "door-open";

export const uiSoundFilePaths: Partial<Record<UISoundName, string>> = {
  open: "/sounds/door-handle.mp3",
  back: "/sounds/back-soft.mp3",
  switch: "/sounds/switch-soft.mp3",
  "door-locked": "/sounds/door-locked.mp3",
  "door-unlock": "/sounds/door-unlock.mp3",
  "door-open": "/sounds/door-open.mp3",
};

type SharedAudioGraph = {
  context: AudioContext;
  uiCompressor: DynamicsCompressorNode;
  uiGain: GainNode;
  musicalCompressor: DynamicsCompressorNode;
  musicalGain: GainNode;
  noiseBuffer: AudioBuffer;
};

type ToneOptions = {
  start: number;
  duration: number;
  frequency: number;
  endFrequency?: number;
  peak: number;
  type?: OscillatorType;
  overtone?: number;
  filterFrequency?: number;
};

type NoiseOptions = {
  start: number;
  duration: number;
  peak: number;
  frequency: number;
  type?: BiquadFilterType;
  q?: number;
};

type SoundAssetState =
  | { status: "loading" }
  | { status: "ready"; buffer: AudioBuffer }
  | { status: "failed" };

let sharedAudioGraph: SharedAudioGraph | null = null;
let uiSoundEnabled = true;
const soundAssetCache = new Map<UISoundName, SoundAssetState>();

function configureCompressor(compressor: DynamicsCompressorNode) {
  compressor.threshold.value = -24;
  compressor.knee.value = 16;
  compressor.ratio.value = 2.5;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.12;
}

function createNoiseBuffer(context: AudioContext) {
  const length = Math.ceil(context.sampleRate * 0.24);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createSharedAudioGraph() {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ||
    (
      window as Window &
        typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        }
    ).webkitAudioContext;

  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const uiCompressor = context.createDynamicsCompressor();
  const uiGain = context.createGain();
  const musicalCompressor = context.createDynamicsCompressor();
  const musicalGain = context.createGain();

  configureCompressor(uiCompressor);
  configureCompressor(musicalCompressor);
  uiGain.gain.value = uiSoundEnabled ? 0.62 : 0;
  musicalGain.gain.value = 0.78;

  uiCompressor.connect(uiGain);
  uiGain.connect(context.destination);
  musicalCompressor.connect(musicalGain);
  musicalGain.connect(context.destination);

  return {
    context,
    uiCompressor,
    uiGain,
    musicalCompressor,
    musicalGain,
    noiseBuffer: createNoiseBuffer(context),
  };
}

function getSharedAudioGraph() {
  if (!sharedAudioGraph || sharedAudioGraph.context.state === "closed") {
    sharedAudioGraph = createSharedAudioGraph();
  }

  return sharedAudioGraph;
}

async function getReadyAudioGraph(forUISound: boolean) {
  if (forUISound && !uiSoundEnabled) return null;

  const graph = getSharedAudioGraph();
  if (!graph) return null;

  if (graph.context.state === "suspended") {
    await graph.context.resume();
  }

  return graph;
}

function playTone(
  context: AudioContext,
  destination: AudioNode,
  {
    start,
    duration,
    frequency,
    endFrequency = frequency,
    peak,
    type = "triangle",
    overtone = 0.08,
    filterFrequency = 4200,
  }: ToneOptions
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const attack = Math.min(0.006, duration * 0.15);
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFrequency, start);
  filter.Q.setValueAtTime(0.6, start);

  oscillator.connect(gain);
  gain.connect(filter);
  filter.connect(destination);
  oscillator.start(start);
  oscillator.stop(end + 0.015);

  if (overtone > 0) {
    const overtoneOscillator = context.createOscillator();
    const overtoneGain = context.createGain();
    const overtoneEnd = start + duration * 0.58;

    overtoneOscillator.type = "sine";
    overtoneOscillator.frequency.setValueAtTime(frequency * 2, start);
    overtoneOscillator.frequency.exponentialRampToValueAtTime(
      endFrequency * 2,
      overtoneEnd
    );
    overtoneGain.gain.setValueAtTime(0.0001, start);
    overtoneGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak * overtone),
      start + attack
    );
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, overtoneEnd);
    overtoneOscillator.connect(overtoneGain);
    overtoneGain.connect(filter);
    overtoneOscillator.start(start);
    overtoneOscillator.stop(overtoneEnd + 0.015);
  }
}

function playNoiseClick(
  graph: SharedAudioGraph,
  destination: AudioNode,
  {
    start,
    duration,
    peak,
    frequency,
    type = "bandpass",
    q = 1.1,
  }: NoiseOptions
) {
  const source = graph.context.createBufferSource();
  const filter = graph.context.createBiquadFilter();
  const gain = graph.context.createGain();
  const end = start + duration;

  source.buffer = graph.noiseBuffer;
  filter.type = type;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.setValueAtTime(q, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start, 0, duration + 0.01);
}

function playTwoTone(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  first: number,
  second: number,
  peak: number,
  spacing = 0.055
) {
  playTone(context, destination, {
    start,
    duration: 0.085,
    frequency: first,
    endFrequency: first * 1.025,
    peak,
  });
  playTone(context, destination, {
    start: start + spacing,
    duration: 0.105,
    frequency: second,
    endFrequency: second * 1.02,
    peak: peak * 0.92,
  });
}

function playWoodClick(
  graph: SharedAudioGraph,
  destination: AudioNode,
  start: number,
  peak = 0.065
) {
  playNoiseClick(graph, destination, {
    start,
    duration: 0.045,
    peak: peak * 0.55,
    frequency: 1180,
    q: 1.35,
  });
  playTone(graph.context, destination, {
    start,
    duration: 0.075,
    frequency: 470,
    endFrequency: 390,
    peak,
    overtone: 0.04,
    filterFrequency: 2800,
  });
}

function playMechanicalClick(
  graph: SharedAudioGraph,
  destination: AudioNode,
  start: number,
  peak = 0.05
) {
  playNoiseClick(graph, destination, {
    start,
    duration: 0.025,
    peak: peak * 0.7,
    frequency: 1900,
    type: "highpass",
    q: 0.7,
  });
  playTone(graph.context, destination, {
    start,
    duration: 0.052,
    frequency: 980,
    endFrequency: 760,
    peak,
    type: "square",
    overtone: 0,
    filterFrequency: 3300,
  });
}

function beginLoadingSoundAsset(
  sound: UISoundName,
  path: string,
  context: AudioContext
) {
  soundAssetCache.set(sound, { status: "loading" });

  void fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => soundAssetCache.set(sound, { status: "ready", buffer }))
    .catch(() => soundAssetCache.set(sound, { status: "failed" }));
}

function playRecordedSoundIfReady(
  sound: UISoundName,
  graph: SharedAudioGraph
) {
  const path = uiSoundFilePaths[sound];
  if (!path) return false;

  const cached = soundAssetCache.get(sound);

  if (!cached) {
    beginLoadingSoundAsset(sound, path, graph.context);
    return false;
  }

  if (cached.status !== "ready") return false;

  const source = graph.context.createBufferSource();
  const gain = graph.context.createGain();
  source.buffer = cached.buffer;
  gain.gain.value = 0.38;
  source.connect(gain);
  gain.connect(graph.uiCompressor);
  source.start();
  return true;
}

function synthesizeUISound(
  sound: UISoundName,
  graph: SharedAudioGraph,
  now: number
) {
  const { context, uiCompressor } = graph;

  switch (sound) {
    case "select":
      playWoodClick(graph, uiCompressor, now, 0.052);
      playTwoTone(context, uiCompressor, now + 0.015, 660, 820, 0.07, 0.045);
      break;
    case "switch":
      playMechanicalClick(graph, uiCompressor, now, 0.038);
      playTwoTone(context, uiCompressor, now + 0.012, 880, 1080, 0.055, 0.032);
      break;
    case "open":
      playMechanicalClick(graph, uiCompressor, now, 0.05);
      playNoiseClick(graph, uiCompressor, {
        start: now + 0.035,
        duration: 0.07,
        peak: 0.022,
        frequency: 1450,
      });
      playTwoTone(context, uiCompressor, now + 0.055, 540, 760, 0.085, 0.075);
      break;
    case "close":
      playMechanicalClick(graph, uiCompressor, now, 0.04);
      playTone(context, uiCompressor, {
        start: now + 0.025,
        duration: 0.12,
        frequency: 760,
        endFrequency: 520,
        peak: 0.065,
      });
      break;
    case "back":
      playWoodClick(graph, uiCompressor, now, 0.055);
      playTwoTone(context, uiCompressor, now + 0.025, 620, 440, 0.07, 0.07);
      break;
    case "confirm":
      playMechanicalClick(graph, uiCompressor, now, 0.035);
      playTwoTone(context, uiCompressor, now + 0.015, 620, 840, 0.072, 0.055);
      break;
    case "cancel":
      playWoodClick(graph, uiCompressor, now, 0.045);
      playTone(context, uiCompressor, {
        start: now + 0.018,
        duration: 0.105,
        frequency: 460,
        endFrequency: 350,
        peak: 0.052,
        overtone: 0.03,
        filterFrequency: 2600,
      });
      break;
    case "unavailable":
      playWoodClick(graph, uiCompressor, now, 0.048);
      playNoiseClick(graph, uiCompressor, {
        start: now + 0.045,
        duration: 0.09,
        peak: 0.018,
        frequency: 1320,
        q: 0.85,
      });
      playTone(context, uiCompressor, {
        start: now + 0.035,
        duration: 0.12,
        frequency: 620,
        endFrequency: 565,
        peak: 0.045,
        overtone: 0.025,
        filterFrequency: 2500,
      });
      break;
    case "reset":
      playWoodClick(graph, uiCompressor, now, 0.04);
      [760, 620, 500].forEach((frequency, index) => {
        playTone(context, uiCompressor, {
          start: now + 0.02 + index * 0.045,
          duration: 0.07,
          frequency,
          endFrequency: frequency * 0.96,
          peak: 0.052 - index * 0.006,
          overtone: 0.03,
        });
      });
      break;
    case "play":
      playMechanicalClick(graph, uiCompressor, now, 0.028);
      playTone(context, uiCompressor, {
        start: now + 0.012,
        duration: 0.07,
        frequency: 720,
        endFrequency: 850,
        peak: 0.035,
        overtone: 0.03,
      });
      break;
    case "success":
    case "door-unlock":
      playMechanicalClick(graph, uiCompressor, now, 0.06);
      playNoiseClick(graph, uiCompressor, {
        start: now + 0.045,
        duration: 0.05,
        peak: 0.027,
        frequency: 1650,
        type: "highpass",
      });
      [659.25, 783.99, 987.77].forEach((frequency, index) => {
        playTone(context, uiCompressor, {
          start: now + 0.07 + index * 0.105,
          duration: 0.2 + index * 0.035,
          frequency,
          endFrequency: frequency * 1.015,
          peak: 0.09 - index * 0.008,
          overtone: 0.11,
          filterFrequency: 4800,
        });
      });
      break;
    case "door-locked":
      playMechanicalClick(graph, uiCompressor, now, 0.065);
      playWoodClick(graph, uiCompressor, now + 0.06, 0.055);
      playTone(context, uiCompressor, {
        start: now + 0.035,
        duration: 0.14,
        frequency: 540,
        endFrequency: 390,
        peak: 0.06,
        overtone: 0.025,
        filterFrequency: 2700,
      });
      break;
    case "door-open":
      playMechanicalClick(graph, uiCompressor, now, 0.06);
      playWoodClick(graph, uiCompressor, now + 0.05, 0.05);
      playNoiseClick(graph, uiCompressor, {
        start: now + 0.09,
        duration: 0.09,
        peak: 0.022,
        frequency: 1250,
      });
      [520, 720, 880].forEach((frequency, index) => {
        playTone(context, uiCompressor, {
          start: now + 0.055 + index * 0.085,
          duration: 0.15 + index * 0.025,
          frequency,
          endFrequency: frequency * 1.025,
          peak: 0.075 - index * 0.006,
          overtone: 0.07,
        });
      });
      break;
  }
}

export function setUISoundEnabled(enabled: boolean) {
  uiSoundEnabled = enabled;

  if (sharedAudioGraph && sharedAudioGraph.context.state !== "closed") {
    const { context, uiGain } = sharedAudioGraph;
    uiGain.gain.cancelScheduledValues(context.currentTime);
    uiGain.gain.setTargetAtTime(enabled ? 0.62 : 0, context.currentTime, 0.008);
  }
}

export async function playUISound(sound: UISoundName) {
  try {
    const graph = await getReadyAudioGraph(true);
    if (!graph) return;

    if (playRecordedSoundIfReady(sound, graph)) return;
    synthesizeUISound(sound, graph, graph.context.currentTime + 0.004);
  } catch {
    // UI sound is progressive enhancement and must never block an action.
  }
}

export async function playMusicalNote(frequency: number) {
  try {
    const graph = await getReadyAudioGraph(false);
    if (!graph) return;

    const { context, musicalCompressor } = graph;
    const now = context.currentTime;
    const mainOscillator = context.createOscillator();
    const overtoneOscillator = context.createOscillator();
    const mainGain = context.createGain();
    const overtoneGain = context.createGain();
    const filter = context.createBiquadFilter();

    mainOscillator.type = "triangle";
    mainOscillator.frequency.setValueAtTime(frequency, now);
    overtoneOscillator.type = "sine";
    overtoneOscillator.frequency.setValueAtTime(frequency * 2, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3400, now);
    filter.Q.setValueAtTime(0.7, now);

    mainGain.gain.setValueAtTime(0.0001, now);
    mainGain.gain.exponentialRampToValueAtTime(0.26, now + 0.015);
    mainGain.gain.setValueAtTime(0.22, now + 0.1);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.055, now + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    mainOscillator.connect(mainGain);
    overtoneOscillator.connect(overtoneGain);
    mainGain.connect(filter);
    overtoneGain.connect(filter);
    filter.connect(musicalCompressor);
    mainOscillator.start(now);
    overtoneOscillator.start(now);
    mainOscillator.stop(now + 0.6);
    overtoneOscillator.stop(now + 0.25);
  } catch {
    // The puzzle keeps visual feedback when Web Audio is unavailable.
  }
}
