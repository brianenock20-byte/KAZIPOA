export const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/i;

export function isValidGaMeasurementId(value: string | undefined): value is string {
  return Boolean(value && GA_MEASUREMENT_ID_PATTERN.test(value.trim()));
}

export function initOptionalGa4(measurementId: string | undefined): boolean {
  if (typeof document === "undefined" || !isValidGaMeasurementId(measurementId)) return false;
  if (document.querySelector(`script[data-kazipoa-ga4="${measurementId}"]`)) return true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.kazipoaGa4 = measurementId;
  document.head.appendChild(script);

  const win = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function (...args: unknown[]) { win.dataLayer?.push(args); };
  win.gtag("js", new Date());
  win.gtag("config", measurementId, { anonymize_ip: true });
  return true;
}
