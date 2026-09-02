export {};

declare global {
  interface Window {
    /** Created by the GTM snippet in components/third-party.tsx. */
    dataLayer?: Record<string, unknown>[];
  }
}
