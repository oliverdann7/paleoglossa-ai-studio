/**
 * Thematic spot illustrations for empty states. Inline SVG (no dependency),
 * drawn with `currentColor` + a softer fill so they inherit the caller's text
 * color (typically `text-gold/60` in EmptyState). Deliberately simple line art
 * to match Paleoglossa's scholarly, parchment aesthetic.
 */
import type { ReactElement, SVGProps } from 'react';

export type SpotIllustrationName = 'scroll' | 'quill' | 'amphora';

const baseProps = (props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: 72,
  height: 72,
  viewBox: '0 0 72 72',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

/** An unrolled scroll — for "no texts / no content" states. */
export const ScrollIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps(props)}>
    <path d="M20 18c0-3.3 2.7-6 6-6h26c3.3 0 6 2.7 6 6v36c0 3.3-2.7 6-6 6H26c-3.3 0-6-2.7-6-6" />
    <path d="M20 18c0 3.3 2.7 6 6 6h6V12" opacity={0.5} />
    <path d="M58 54c0-3.3-2.7-6-6-6h-6v12" opacity={0.5} />
    <path d="M30 28h18M30 35h18M30 42h12" opacity={0.8} />
  </svg>
);

/** A quill pen — for "no notes / no writing" states. */
export const QuillIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps(props)}>
    <path d="M50 16c-6 2-14 6-20 12s-10 14-12 20" />
    <path d="M50 16c2 8 0 16-6 22s-14 8-22 6" opacity={0.5} />
    <path d="M18 48l-4 8 8-4" />
    <path d="M22 44l6 6" opacity={0.8} />
  </svg>
);

/** An amphora — for "nothing saved / empty collection" states. */
export const AmphoraIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps(props)}>
    <path d="M28 14h16" />
    <path d="M30 14c0 5-6 7-6 14 0 8 4 12 4 18 0 4 3 8 8 8s8-4 8-8c0-6 4-10 4-18 0-7-6-9-6-14" />
    <path d="M30 22c-5 1-9 4-9 9M42 22c5 1 9 4 9 9" opacity={0.5} />
    <path d="M30 40h12" opacity={0.8} />
  </svg>
);

const REGISTRY: Record<SpotIllustrationName, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  scroll: ScrollIllustration,
  quill: QuillIllustration,
  amphora: AmphoraIllustration,
};

export const SpotIllustration = ({
  name,
  ...props
}: { name: SpotIllustrationName } & SVGProps<SVGSVGElement>) => {
  const Component = REGISTRY[name];
  return <Component {...props} />;
};
