/** The public address of the site, no trailing slash. Set SITE_URL in production (client item 14: the domain). */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const configured = process.env.SITE_URL?.trim() || (vercelHost ? `https://${vercelHost}` : "http://localhost:3100");
export const siteUrl = (/^https?:\/\//.test(configured) ? configured : `https://${configured}`).replace(/\/$/, "");

/** Makes a path or an already absolute URL absolute. */
export const absolute = (pathOrUrl: string) => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl}${pathOrUrl}`);
