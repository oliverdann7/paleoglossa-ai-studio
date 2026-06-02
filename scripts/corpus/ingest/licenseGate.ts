/**
 * License gate — the enforced, not merely documented, legal check for the
 * ingestion pipeline.
 *
 * Paleoglossa is a commercial product, so by default a text may be written to
 * the served corpus only if its source attribution permits BOTH commercial use
 * AND modification ({@link isCommercialSafe}). A source that fails this gate
 * (e.g. PROIEL — CC BY-NC-SA) is refused unless the maintainer passes an
 * explicit `--allow-noncommercial` override. Share-alike sources pass the gate
 * but emit a warning, because the data must remain shareable downstream.
 *
 * This is the operationalization of the "corpus-sources registry" correction:
 * the registry ({@link ATTRIBUTIONS}) is the data; this is the check.
 */

import {
  getAttribution,
  isCommercialSafe,
} from '../../../src/data/attributions.js';

export interface LicenseGateOptions {
  /** Bypass the commercial gate (for personal/research/non-commercial builds). */
  allowNonCommercial?: boolean;
}

export interface LicenseGateResult {
  ok: boolean;
  /** Human-readable reason when the gate blocks. */
  reason?: string;
  warnings: string[];
}

/**
 * Evaluate the gate for a given attribution id. Returns a structured result;
 * callers decide whether to abort. {@link assertLicenseAllowsIngest} is the
 * throwing convenience wrapper used by the CLI.
 */
export function checkLicense(
  attributionId: string | undefined,
  opts: LicenseGateOptions = {}
): LicenseGateResult {
  const warnings: string[] = [];

  if (!attributionId) {
    warnings.push(
      'No --attribution given: the served text will carry no source credit. ' +
        'Pass --attribution <id> to record provenance and enforce licensing.'
    );
    return { ok: true, warnings };
  }

  const attr = getAttribution(attributionId);
  if (!attr) {
    return {
      ok: false,
      reason: `Unknown attribution id "${attributionId}". Add it to src/data/attributions.ts first.`,
      warnings,
    };
  }

  if (attr.shareAlike) {
    warnings.push(
      `Source "${attr.sourceName}" is share-alike (${attr.licenseName}): the derived corpus data must remain shareable under the same terms.`
    );
  }

  if (!isCommercialSafe(attr)) {
    if (opts.allowNonCommercial) {
      warnings.push(
        `Source "${attr.sourceName}" (${attr.licenseName}) is NOT commercial-safe but --allow-noncommercial was passed. Do not ship this in the paid product.`
      );
      return { ok: true, warnings };
    }
    const why = !attr.allowsCommercialUse
      ? 'does not permit commercial use'
      : 'does not permit modification';
    return {
      ok: false,
      reason:
        `Source "${attr.sourceName}" (${attr.licenseName}) ${why}; ` +
        `blocked for the commercial product. Re-run with --allow-noncommercial only for a non-commercial build.`,
      warnings,
    };
  }

  return { ok: true, warnings };
}

/** Throwing wrapper: prints warnings, aborts the process if the gate blocks. */
export function assertLicenseAllowsIngest(
  attributionId: string | undefined,
  opts: LicenseGateOptions = {}
): void {
  const result = checkLicense(attributionId, opts);
  for (const w of result.warnings) console.warn(`[ingest] ⚠ ${w}`);
  if (!result.ok) {
    console.error(`[ingest] ✗ License gate blocked: ${result.reason}`);
    process.exit(1);
  }
}
