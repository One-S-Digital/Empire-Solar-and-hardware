/** The public address of the site, no trailing slash. Set SITE_URL in production (client item 14: the domain). */
export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");

/** Makes a path or an already absolute URL absolute. */
export const absolute = (pathOrUrl: string) => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl}${pathOrUrl}`);
