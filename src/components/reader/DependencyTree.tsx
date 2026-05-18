import { useMemo } from 'react';

export interface DepToken {
  index: number;
  form: string;
  lemma: string;
  pos: string;
  head: number; // -1 = root
  relation: string;
}

interface Props {
  tokens: DepToken[];
  isRTL?: boolean;
  selectedIndex?: number | null;
  onTokenClick?: (index: number) => void;
}

// Universal Dependencies relation color categories
const RELATION_COLORS: Record<string, string> = {
  root: '#e0a800',
  nsubj: '#2d9e5f',
  'nsubj:pass': '#2d9e5f',
  csubj: '#2d9e5f',
  'csubj:pass': '#2d9e5f',
  obj: '#2563eb',
  iobj: '#2563eb',
  obl: '#7c3aed',
  'obl:agent': '#7c3aed',
  nmod: '#d97706',
  amod: '#d97706',
  nummod: '#d97706',
  appos: '#d97706',
  aux: '#64748b',
  'aux:pass': '#64748b',
  cop: '#64748b',
  det: '#94a3b8',
  case: '#94a3b8',
  mark: '#94a3b8',
  cc: '#94a3b8',
  conj: '#be123c',
  advmod: '#0891b2',
  advcl: '#0891b2',
  acl: '#0891b2',
  'acl:relcl': '#0891b2',
  xcomp: '#0891b2',
  ccomp: '#0891b2',
  compound: '#6d28d9',
  flat: '#6d28d9',
  vocative: '#db2777',
  discourse: '#db2777',
  punct: '#cbd5e1',
  dep: '#94a3b8',
};

function getColor(relation: string): string {
  return RELATION_COLORS[relation] ?? '#94a3b8';
}

const TOKEN_WIDTH = 72;
const TOKEN_GAP = 36;
const TOKEN_SPACING = TOKEN_WIDTH + TOKEN_GAP;
const TOKEN_BOX_HEIGHT = 52; // form + pos label
const ARC_BASE_HEIGHT = 32;
const ARC_HEIGHT_PER_DISTANCE = 22;
const SVG_PADDING_X = 24;
const ROOT_ARROW_HEIGHT = 28;

export function DependencyTree({ tokens, isRTL = false, selectedIndex, onTokenClick }: Props) {
  const n = tokens.length;

  // Max arc height determines how tall the SVG must be
  const maxDistance = useMemo(() => {
    let max = 1;
    for (const t of tokens) {
      if (t.head === -1) continue;
      const dist = Math.abs(t.index - t.head);
      if (dist > max) max = dist;
    }
    return max;
  }, [tokens]);

  const maxArcHeight = ARC_BASE_HEIGHT + maxDistance * ARC_HEIGHT_PER_DISTANCE;
  const svgHeight = ROOT_ARROW_HEIGHT + maxArcHeight + TOKEN_BOX_HEIGHT + 16;
  const svgWidth = n * TOKEN_SPACING + SVG_PADDING_X * 2;

  // Token center X positions — reversed for RTL
  function tokenX(index: number) {
    const visual = isRTL ? n - 1 - index : index;
    return SVG_PADDING_X + visual * TOKEN_SPACING + TOKEN_WIDTH / 2;
  }

  const tokenTopY = ROOT_ARROW_HEIGHT + maxArcHeight;

  // Arcs sorted by distance (render shorter arcs last so they appear on top)
  const arcs = useMemo(() => {
    return tokens
      .filter((t) => t.head !== -1)
      .map((t) => ({
        dep: t.index,
        head: t.head,
        relation: t.relation,
        distance: Math.abs(t.index - t.head),
      }))
      .sort((a, b) => b.distance - a.distance);
  }, [tokens]);

  // Root token
  const rootToken = tokens.find((t) => t.head === -1);

  return (
    <div className="overflow-x-auto w-full">
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block', minWidth: svgWidth }}
        aria-label="Dependency tree diagram"
      >
        {/* Root arrow */}
        {rootToken &&
          (() => {
            const rx = tokenX(rootToken.index);
            const ry = tokenTopY;
            return (
              <g key="root-arrow">
                <line
                  x1={rx}
                  y1={ROOT_ARROW_HEIGHT}
                  x2={rx}
                  y2={ry - 4}
                  stroke={RELATION_COLORS.root}
                  strokeWidth={2}
                />
                <polygon
                  points={`${rx - 5},${ry - 4} ${rx + 5},${ry - 4} ${rx},${ry}`}
                  fill={RELATION_COLORS.root}
                />
                <text
                  x={rx}
                  y={ROOT_ARROW_HEIGHT - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="700"
                  fill={RELATION_COLORS.root}
                  fontFamily="monospace"
                  letterSpacing={0.5}
                >
                  ROOT
                </text>
              </g>
            );
          })()}

        {/* Dependency arcs */}
        {arcs.map(({ dep, head, relation, distance }) => {
          const x1 = tokenX(head);
          const x2 = tokenX(dep);
          const midX = (x1 + x2) / 2;
          const arcH = ARC_BASE_HEIGHT + distance * ARC_HEIGHT_PER_DISTANCE;
          const baseY = tokenTopY;
          const color = getColor(relation);

          // Quadratic bezier arc upward
          const path = `M ${x1},${baseY} Q ${midX},${baseY - arcH} ${x2},${baseY}`;

          // Arrow head at the dependent end (x2, baseY)
          const dx = x2 - midX;
          const dy = baseY - (baseY - arcH);
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const arrowSize = 5;
          const ax1 = x2 - ux * arrowSize - uy * arrowSize * 0.5;
          const ay1 = baseY - uy * arrowSize + ux * arrowSize * 0.5;
          const ax2 = x2 - ux * arrowSize + uy * arrowSize * 0.5;
          const ay2 = baseY - uy * arrowSize - ux * arrowSize * 0.5;

          const labelY = baseY - arcH - 3;
          const isSelected = dep === selectedIndex || head === selectedIndex;

          return (
            <g key={`arc-${dep}-${head}`}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeOpacity={isSelected ? 1 : 0.75}
              />
              <polygon
                points={`${x2},${baseY} ${ax1},${ay1} ${ax2},${ay2}`}
                fill={color}
                fillOpacity={isSelected ? 1 : 0.75}
              />
              {/* Relation label */}
              <rect
                x={midX - 18}
                y={labelY - 9}
                width={36}
                height={12}
                rx={3}
                fill="white"
                fillOpacity={0.92}
              />
              <text
                x={midX}
                y={labelY}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight="600"
                fill={color}
                fontFamily="monospace"
              >
                {relation.length > 6 ? relation.slice(0, 6) : relation}
              </text>
            </g>
          );
        })}

        {/* Token boxes */}
        {tokens.map((token) => {
          const cx = tokenX(token.index);
          const x = cx - TOKEN_WIDTH / 2;
          const isSelected = token.index === selectedIndex;
          const color = getColor(token.relation);
          const isRoot = token.head === -1;

          return (
            <g
              key={`tok-${token.index}`}
              onClick={() => onTokenClick?.(token.index)}
              style={{ cursor: onTokenClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={tokenTopY}
                width={TOKEN_WIDTH}
                height={TOKEN_BOX_HEIGHT}
                rx={6}
                fill={isSelected ? '#f0f7ff' : '#faf9f7'}
                stroke={isSelected ? '#2563eb' : isRoot ? RELATION_COLORS.root : '#d4cfc7'}
                strokeWidth={isSelected ? 2 : 1}
              />
              {/* Word form */}
              <text
                x={cx}
                y={tokenTopY + 20}
                textAnchor="middle"
                fontSize={13}
                fontWeight={isRoot ? '700' : '500'}
                fill="#1c1917"
                fontFamily="serif"
              >
                {token.form.length > 9 ? token.form.slice(0, 8) + '…' : token.form}
              </text>
              {/* POS tag */}
              <text
                x={cx}
                y={tokenTopY + 35}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight="700"
                fill={isRoot ? RELATION_COLORS.root : color}
                fontFamily="monospace"
                letterSpacing={0.5}
              >
                {token.pos}
              </text>
              {/* Lemma */}
              <text
                x={cx}
                y={tokenTopY + 48}
                textAnchor="middle"
                fontSize={8}
                fill="#78716c"
                fontFamily="serif"
                fontStyle="italic"
              >
                {token.lemma.length > 10 ? token.lemma.slice(0, 9) + '…' : token.lemma}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
