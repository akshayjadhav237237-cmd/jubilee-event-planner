export const CSP_HEADER =
  "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; object-src 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none';";

/** Returns the HTML meta tag representation of the Content Security Policy header. */
export function getCspMetaTag(): string {
  return `<meta http-equiv="Content-Security-Policy" content="${CSP_HEADER}" />`;
}
