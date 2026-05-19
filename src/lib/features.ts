/**
 * Feature flag management.
 * Centralizing checks for environment-based features.
 */

export const features = {
  // Mobile purchases enabled flag
  isMobilePurchaseEnabled: () => {
    return import.meta.env.VITE_ENABLE_MOBILE_PURCHASES === 'true';
  },
  // Community/social features enabled flag
  isCommunityEnabled: () => {
    return import.meta.env.VITE_ENABLE_COMMUNITY === 'true';
  },
};
