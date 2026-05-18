/**
 * Community is enabled on web by default.
 * On native mobile (Capacitor) it is disabled by default until moderation
 * tools and App Store review guidelines are fully satisfied.
 *
 * Override in .env / Vercel env vars:
 *   VITE_ENABLE_COMMUNITY=true          (web, default true)
 *   VITE_ENABLE_COMMUNITY_MOBILE=false  (native iOS/Android, default false)
 */
export const COMMUNITY_ENABLED: boolean = import.meta.env.VITE_ENABLE_COMMUNITY !== 'false';
export const COMMUNITY_MOBILE_ENABLED: boolean =
  import.meta.env.VITE_ENABLE_COMMUNITY_MOBILE === 'true';
