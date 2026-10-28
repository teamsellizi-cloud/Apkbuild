import { PWAManifestCheck } from "@/types";

// SSRF Protection Helper
export function isAllowedUrl(urlString: string): { allowed: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { allowed: false, reason: "Only HTTP/HTTPS URLs are allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost, IP literals for private/link-local networks
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.startsWith("169.254.") ||
      hostname.endsWith(".internal")
    ) {
      return { allowed: false, reason: "Internal or local network addresses are blocked for security." };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: "Invalid URL format." };
  }
}

export async function analyzePWA(targetUrl: string): Promise<PWAManifestCheck> {
  const result: PWAManifestCheck = {
    url: targetUrl,
    hasManifest: false,
    iconsCount: 0,
    has512Icon: false,
    hasMaskableIcon: false,
    hasServiceWorker: false,
    isTwaReady: false,
    issues: [],
    warnings: [],
  };

  const validation = isAllowedUrl(targetUrl);
  if (!validation.allowed) {
    result.issues.push(validation.reason || "Invalid URL");
    return result;
  }

  try {
    // 1. Fetch HTML of the target site
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 APKBuilder/1.0",
        Accept: "text/html,application/xhtml+xml,application/json,*/*",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      result.issues.push(`Server returned status code ${res.status} (${res.statusText})`);
      return result;
    }

    const html = await res.text();

    // 2. Look for manifest link in HTML
    let manifestHref: string | null = null;
    const manifestRegex = /<link\s+[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*>/i;
    const manifestMatch = html.match(manifestRegex);

    if (manifestMatch && manifestMatch[1]) {
      manifestHref = manifestMatch[1];
    } else {
      const manifestRegex2 = /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']manifest["'][^>]*>/i;
      const manifestMatch2 = html.match(manifestRegex2);
      if (manifestMatch2 && manifestMatch2[1]) {
        manifestHref = manifestMatch2[1];
      }
    }

    // Try common manifest paths if none found in HTML
    const manifestCandidateUrls: string[] = [];
    if (manifestHref) {
      manifestCandidateUrls.push(new URL(manifestHref, targetUrl).toString());
    }
    manifestCandidateUrls.push(
      new URL("/manifest.json", targetUrl).toString(),
      new URL("/manifest.webmanifest", targetUrl).toString(),
      new URL("/site.webmanifest", targetUrl).toString()
    );

    let manifestData: Record<string, unknown> | null = null;
    let resolvedManifestUrl: string | null = null;

    for (const manifestUrl of manifestCandidateUrls) {
      try {
        const mController = new AbortController();
        const mTimeout = setTimeout(() => mController.abort(), 4000);
        const mRes = await fetch(manifestUrl, {
          signal: mController.signal,
          headers: { Accept: "application/manifest+json,application/json,*/*" },
        });
        clearTimeout(mTimeout);

        if (mRes.ok) {
          const json = await mRes.json();
          if (json && typeof json === "object") {
            manifestData = json as Record<string, unknown>;
            resolvedManifestUrl = manifestUrl;
            break;
          }
        }
      } catch {
        // Continue to next candidate
      }
    }

    if (manifestData && resolvedManifestUrl) {
      result.hasManifest = true;
      result.manifestUrl = resolvedManifestUrl;
      result.manifestData = manifestData;
      result.name = (manifestData.name as string) || (manifestData.short_name as string);
      result.shortName = (manifestData.short_name as string) || (manifestData.name as string);
      result.startUrl = (manifestData.start_url as string) || "/";
      result.display = (manifestData.display as string) || "browser";
      result.themeColor = (manifestData.theme_color as string) || "#ffffff";
      result.backgroundColor = (manifestData.background_color as string) || "#ffffff";

      // Inspect Icons
      interface ManifestIcon {
        src?: string;
        sizes?: string;
        type?: string;
        purpose?: string;
      }
      const icons = (manifestData.icons as ManifestIcon[]) || [];
      result.iconsCount = icons.length;

      let largestSize = 0;
      let largestIconUrl = "";

      for (const icon of icons) {
        if (!icon.src) continue;
        const iconFullUrl = new URL(icon.src, resolvedManifestUrl).toString();
        const sizesStr = icon.sizes || "";
        const purpose = (icon.purpose || "").toLowerCase();

        if (purpose.includes("maskable")) {
          result.hasMaskableIcon = true;
        }

        const sizeMatches = sizesStr.match(/(\d+)x(\d+)/);
        if (sizeMatches) {
          const width = parseInt(sizeMatches[1], 10);
          if (width >= 512) {
            result.has512Icon = true;
          }
          if (width > largestSize) {
            largestSize = width;
            largestIconUrl = iconFullUrl;
          }
        } else if (!largestIconUrl) {
          largestIconUrl = iconFullUrl;
        }
      }

      result.iconLargestUrl = largestIconUrl;

      // Check Display mode for TWA
      if (result.display !== "standalone" && result.display !== "fullscreen") {
        result.warnings.push(
          `Manifest display is '${result.display}'. Bubblewrap / TWA requires 'standalone' or 'fullscreen'.`
        );
      }

      // Check Icons
      if (!result.has512Icon) {
        result.issues.push(
          "PWA Manifest is missing a 512x512 PNG icon (required for Google Play & TWA splash screen)."
        );
      }
      if (!result.hasMaskableIcon) {
        result.warnings.push(
          "No 'maskable' purpose icon found. Adaptive icons will use square fallback."
        );
      }
    } else {
      result.issues.push("No valid PWA Web App Manifest found (manifest.json).");
    }

    // 3. Service Worker Detection
    if (
      html.includes("serviceWorker.register") ||
      html.includes("navigator.serviceWorker") ||
      html.includes("workbox")
    ) {
      result.hasServiceWorker = true;
    } else {
      // Check for /sw.js or /service-worker.js
      const swCandidates = [
        new URL("/sw.js", targetUrl).toString(),
        new URL("/service-worker.js", targetUrl).toString(),
      ];
      for (const swUrl of swCandidates) {
        try {
          const swController = new AbortController();
          const swTimeout = setTimeout(() => swController.abort(), 3000);
          const swRes = await fetch(swUrl, { signal: swController.signal, method: "HEAD" });
          clearTimeout(swTimeout);
          if (swRes.ok) {
            result.hasServiceWorker = true;
            result.serviceWorkerUrl = swUrl;
            break;
          }
        } catch {
          // Ignore
        }
      }
    }

    if (!result.hasServiceWorker) {
      result.warnings.push(
        "Service worker registration was not detected. Offline caching may be limited."
      );
    }

    // Final TWA Readiness determination
    result.isTwaReady =
      result.hasManifest &&
      result.has512Icon &&
      (result.display === "standalone" || result.display === "fullscreen" || result.display === "minimal-ui");
  } catch (err: unknown) {
    const error = err as Error;
    result.issues.push(`Failed to fetch and analyze URL: ${error.message || "Network error"}`);
  }

  return result;
}
