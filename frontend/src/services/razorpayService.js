function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'))
    document.head.appendChild(script)
  })
}

export async function openRazorpayCheckout({ details, customer, onSuccess, onDismiss }) {
  await loadRazorpay()
  const checkout = new window.Razorpay({
    key: details.apiKey,
    amount: details.amount,
    currency: details.currency,
    order_id: details.orderId,
    name: 'Northstar',
    description: 'Order payment',
    prefill: { name: customer.name, email: customer.email },
    theme: { color: '#153f38' },
    handler: (response) => onSuccess({
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
    }),
    modal: { ondismiss: onDismiss },
  })
  checkout.open()
}
