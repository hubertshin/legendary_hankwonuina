export const initPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  const f = window as any;
  if (f.fbq) return;
  const n: any = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(t);
  f.fbq('init', pixelId);
  f.fbq('track', 'PageView');
};

export const trackLead = () => {
  const f = window as any;
  if (f.fbq) f.fbq('track', 'Lead');
};
