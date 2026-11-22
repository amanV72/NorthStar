import { useEffect, useState } from 'react'
import { Icon } from './Icons'

export function AddressModal({
  open,
  initialAddress = null,
  onClose,
  onSave,
  saving = false,
  isCheckoutGate = false,
  defaultName = '',
}) {
  const [form, setForm] = useState({
    name: initialAddress?.name || defaultName || '',
    phone: initialAddress?.phone || '',
    street: initialAddress?.street || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipcode: initialAddress?.zipcode || '',
    country: initialAddress?.country || 'India',
    type: initialAddress?.type || 'Home',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialAddress) {
      setForm({
        name: initialAddress.name || defaultName || '',
        phone: initialAddress.phone || '',
        street: initialAddress.street || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipcode: initialAddress.zipcode || '',
        country: initialAddress.country || 'India',
        type: initialAddress.type || 'Home',
      })
    } else {
      setForm({
        name: defaultName || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        type: 'Home',
      })
    }
    setError('')
  }, [initialAddress, defaultName, open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zipcode.trim()) {
      setError('Please fill in all required address fields.')
      return
    }
    if (form.phone && form.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid 10-digit contact phone number.')
      return
    }
    setError('')
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipcode: form.zipcode.trim(),
      country: form.country.trim(),
      type: form.type,
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="address-modal-container" role="dialog" aria-modal="true">
        <button
          type="button"
          className="modal-close icon-button"
          disabled={saving}
          onClick={onClose}
          aria-label="Close address dialog"
        >
          <Icon name="close" />
        </button>

        {isCheckoutGate ? (
          <div className="address-gate-header">
            <span className="address-gate-pill">
              <Icon name="mapPin" size={14} /> Shipping Destination Required
            </span>
            <h2>Where should we deliver?</h2>
            <p>Please enter your delivery destination before proceeding to payment.</p>
          </div>
        ) : (
          <div className="address-modal-header">
            <span className="eyebrow"><span /> Shipping profile</span>
            <h2>{initialAddress ? 'Update Delivery Address' : 'Add Delivery Address'}</h2>
            <p>Your address will be used to coordinate white-glove doorstep delivery.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="address-modal-form">
          {error && <div className="address-form-error">{error}</div>}

          <div className="address-type-selector">
            <label className="field-label-small">Address Type</label>
            <div className="type-pills-row">
              {['Home', 'Work', 'Studio'].map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`type-pill-btn ${form.type === t ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, type: t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>
              <span>Recipient Full Name *</span>
              <input
                required
                placeholder="e.g. Pranav Jadhav"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              <span>Contact Mobile *</span>
              <input
                required
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>

          <label>
            <span>Flat / House No., Apartment, Street *</span>
            <input
              required
              placeholder="e.g. Flat 402, Oakwood Heights, 12th Main Road"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </label>

          <div className="form-row" style={{ gridTemplateColumns: '1.2fr 1.2fr 0.8fr' }}>
            <label>
              <span>City *</span>
              <input
                required
                placeholder="e.g. Bengaluru"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label>
              <span>State *</span>
              <input
                required
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </label>
            <label>
              <span>PIN Code *</span>
              <input
                required
                placeholder="e.g. 560001"
                maxLength={6}
                value={form.zipcode}
                onChange={(e) => setForm({ ...form, zipcode: e.target.value.replace(/[^0-9]/g, '') })}
              />
            </label>
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="secondary-button"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? 'Saving address…' : isCheckoutGate ? 'Save & Continue to Checkout' : 'Save address'}
              <Icon name="arrow" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
