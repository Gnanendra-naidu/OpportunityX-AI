/**
 * OpportunityX-AI: Centralized Scholarship URL Verification & Resolution Engine
 * 
 * Ensures:
 * 1. Consistent, verified application URLs across cards, detail modals, saved items, and matching results.
 * 2. Strict URL validation (malformed URL detection, protocol enforcement, dead link corrections).
 * 3. Graceful handling of unverified/prototype demo links ("Official link unavailable").
 * 4. Error isolation: invalid or broken URLs never crash component rendering.
 */

import { Opportunity } from "@/types";

export type VerifiedUrlResult =
  | {
      url: string;
      isAvailable: true;
      label: string;
      portalName: string;
      domain: string;
      isGovernmentDomain: boolean;
    }
  | {
      url: undefined;
      isAvailable: false;
      label: string;
      portalName: string;
      domain: string;
      isGovernmentDomain: boolean;
    };

export interface NormalizedUrlResult {
  url: string;
  isAvailable: boolean;
  domain: string;
}

// Known dead/broken URLs mapped to their canonical, working official sovereign portals
const CANONICAL_URL_CORRECTIONS: Record<string, string> = {
  // PMRF subpage /apply is 404; canonical portal is https://www.pmrf.in
  "https://www.pmrf.in/apply": "https://www.pmrf.in",
  "http://www.pmrf.in/apply": "https://www.pmrf.in",
  "https://pmrf.in/apply": "https://www.pmrf.in",

  // AICTE deep link has moved; official portal is AICTE main site or National Scholarship Portal
  "https://www.aicte-india.org/schemes/students-development-schemes/Pragati": "https://scholarships.gov.in",
  "http://www.aicte-india.org/schemes/students-development-schemes/Pragati": "https://scholarships.gov.in",

  // Central CSSS direct scheme link
  "https://www.education.gov.in/higher_education": "https://scholarships.gov.in",
};

// Domains that are simulated demo prototype placeholders and not external sovereign portals
const DEMO_PLACEHOLDER_DOMAINS = new Set([
  "opportunityx.in",
  "www.opportunityx.in",
  "localhost",
  "example.com",
]);

/**
 * Normalizes and validates a single URL candidate.
 * Returns null if the URL is empty, malformed, or an unverified placeholder domain.
 */
export function normalizeOpportunityUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  let trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed === "#" ||
    trimmed === "/" ||
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed.toLowerCase() === "undefined" ||
    trimmed.toLowerCase() === "null"
  ) {
    return null;
  }

  // Prepend https:// if protocol is omitted
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }

  // Check canonical corrections
  const withoutTrailingSlash = trimmed.replace(/\/$/, "");
  if (CANONICAL_URL_CORRECTIONS[withoutTrailingSlash]) {
    trimmed = CANONICAL_URL_CORRECTIONS[withoutTrailingSlash];
  } else if (CANONICAL_URL_CORRECTIONS[trimmed]) {
    trimmed = CANONICAL_URL_CORRECTIONS[trimmed];
  }

  try {
    const parsed = new URL(trimmed);

    // Reject non-http(s) protocols
    if (!parsed.protocol.startsWith("http")) {
      return null;
    }

    // Reject placeholder or internal domains
    const hostname = parsed.hostname.toLowerCase();
    if (DEMO_PLACEHOLDER_DOMAINS.has(hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validates and normalizes any URL string, returning an object with availability status.
 */
export function validateAndNormalizeUrl(rawUrl?: string | null): NormalizedUrlResult {
  const norm = normalizeOpportunityUrl(rawUrl);
  if (!norm) {
    return { url: "", isAvailable: false, domain: "" };
  }
  try {
    const domain = new URL(norm).hostname.toLowerCase();
    return { url: norm, isAvailable: true, domain };
  } catch {
    return { url: "", isAvailable: false, domain: "" };
  }
}

/**
 * Derives the single authoritative, verified application/portal URL for an opportunity.
 * Fallback priority:
 *   1. opportunity.applicationUrl
 *   2. opportunity.officialPortalUrl
 *   3. opportunity.officialSource.url
 *   4. opportunity.officialWebsite
 */
export function getVerifiedOpportunityUrl(
  opportunity?: Partial<Opportunity> | null
): VerifiedUrlResult {
  if (!opportunity) {
    return {
      url: undefined,
      isAvailable: false,
      label: "Official link unavailable",
      portalName: "Official Portal",
      domain: "",
      isGovernmentDomain: false,
    };
  }

  const portalName =
    opportunity.officialSource?.portalName ||
    opportunity.providerName ||
    opportunity.provider ||
    "Official Portal";

  // Try candidate URLs in strict priority order
  const candidateUrls = [
    opportunity.applicationUrl,
    opportunity.officialPortalUrl,
    opportunity.officialSource?.url,
    opportunity.officialWebsite,
  ];

  let verifiedUrl: string | null = null;
  for (const candidate of candidateUrls) {
    const normalized = normalizeOpportunityUrl(candidate);
    if (normalized) {
      verifiedUrl = normalized;
      break;
    }
  }

  if (!verifiedUrl) {
    return {
      url: undefined,
      isAvailable: false,
      label: "Official link unavailable",
      portalName,
      domain: "",
      isGovernmentDomain: false,
    };
  }

  try {
    const parsed = new URL(verifiedUrl);
    const domain = parsed.hostname.toLowerCase();
    const isGov = domain.endsWith(".gov.in") || domain.endsWith(".nic.in") || domain.endsWith(".edu.in");

    return {
      url: verifiedUrl,
      isAvailable: true,
      label: "Official Portal",
      portalName,
      domain,
      isGovernmentDomain: isGov,
    };
  } catch {
    return {
      url: undefined,
      isAvailable: false,
      label: "Official link unavailable",
      portalName,
      domain: "",
      isGovernmentDomain: false,
    };
  }
}
