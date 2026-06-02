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
  // Tutor marketplace (Phase 0: internal-only; gates routes + nav)
  isMarketplaceEnabled: () => {
    return import.meta.env.VITE_ENABLE_MARKETPLACE === 'true';
  },
  // Experimental surfaces that ship without seeded content (Syntax treebank,
  // Manuscripts catalog). Gated off in production so they don't read as
  // unfinished; flip on in dev to work on them. Promote a surface out of this
  // gate once its content is bulk-loaded.
  isExperimentalEnabled: () => {
    return import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true';
  },
};
