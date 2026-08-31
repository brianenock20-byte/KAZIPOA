/**
 * Build a built-in storage URL at runtime.
 *
 * Keeping the path dynamic prevents Vite from treating `/manus-storage/*`
 * references as local assets during the production build, while preserving the
 * server-managed storage route and its access policy.
 */
export function storageUrl(key: string): string {
  return `/manus-storage/${key}`;
}
