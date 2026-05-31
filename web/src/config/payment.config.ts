/** Checkout payment UI — frontend only (not a security boundary). */

/** `true`: show MoMo / VNPay / PayOS immediately (production). */
export const checkoutPaymentEnabled =
  import.meta.env.VITE_ENABLE_CHECKOUT_PAYMENT === 'true'

/** Dev password when payment gate is active (compare on client). */
export const checkoutPaymentDevPassword =
  (import.meta.env.VITE_CHECKOUT_PAYMENT_DEV_PASSWORD as string | undefined)?.trim() ?? ''
