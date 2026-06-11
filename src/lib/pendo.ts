declare global {
  interface Window {
    pendo?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function pendoTrack(event: string, properties?: Record<string, unknown>) {
  if (window.pendo?.track) {
    window.pendo.track(event, properties);
  }
}
