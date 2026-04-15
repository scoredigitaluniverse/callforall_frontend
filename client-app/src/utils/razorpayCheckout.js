const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const DEFAULT_BRAND_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#0b3d91" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#ffffff">CFA</text>
</svg>
`)}`;

let checkoutScriptLoader = null;

export const loadRazorpayCheckout = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (checkoutScriptLoader) return checkoutScriptLoader;

  checkoutScriptLoader = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${CHECKOUT_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return checkoutScriptLoader;
};

export const openRazorpayCheckout = ({
  keyId,
  order,
  name = 'Call For All',
  description = 'Provider booking payment',
  image = DEFAULT_BRAND_IMAGE,
  prefill = {},
  notes = {},
  theme = { color: '#2563eb' },
}) =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    if (!keyId || !order?.id || !order?.amount || !order?.currency) {
      reject(new Error('Invalid Razorpay checkout payload'));
      return;
    }

    const instance = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name,
      description,
      image,
      order_id: order.id,
      prefill,
      notes,
      theme,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
      },
    });

    instance.on('payment.failed', (event) => {
      reject(new Error(event?.error?.description || 'Payment failed'));
    });

    instance.open();
  });
