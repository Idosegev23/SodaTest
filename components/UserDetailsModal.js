import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function UserDetailsModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    consent: false
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'שם מלא הוא שדה חובה'
    }
    
    if (!formData.user_email.trim()) {
      newErrors.user_email = 'כתובת אימייל היא שדה חובה'
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = 'כתובת אימייל לא תקינה'
    }
    
    if (!formData.user_phone.trim()) {
      newErrors.user_phone = 'מספר טלפון הוא שדה חובה'
    } else if (!/^0\d{8,9}$/.test(formData.user_phone.replace(/[-\s]/g, ''))) {
      newErrors.user_phone = 'מספר טלפון לא תקין (יש להתחיל ב-0)'
    }
    
    if (!formData.consent) {
      newErrors.consent = 'יש לאשר את תנאי השימוש ומדיניות הפרטיות'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // נקה שגיאה כשהמשתמש מתחיל להקליד
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded bg-[var(--color-bg)] border border-[var(--color-gold-border)] p-8 text-right align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-8">
                  <button
                    type="button"
                    className="text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors focus:outline-none focus:text-[var(--color-gold)]"
                    onClick={onClose}
                    aria-label="סגור חלון"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <Dialog.Title as="h3" className="text-xl font-heebo font-light text-[var(--color-text)]">
                    פרטים ליצירת האמנות
                  </Dialog.Title>
                </div>

                <div className="mb-6 text-center">
                  <p className="text-[var(--color-muted)] font-heebo font-light leading-relaxed">
                    כדי ליצור את יצירת האמנות שלך עם <span className="text-[var(--color-gold)]">SodaStream ENSŌ</span>, נצטרך כמה פרטים בסיסיים
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label 
                      htmlFor="user-name"
                      className="block text-sm font-heebo font-medium text-[var(--color-text)] mb-3"
                    >
                      שם מלא *
                    </label>
                    <input
                      id="user-name"
                      type="text"
                      value={formData.user_name}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded bg-[var(--color-bg)] text-[var(--color-text)] font-heebo focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-all ${
                        errors.user_name ? 'border-red-500' : 'border-[var(--color-gold-border)]'
                      }`}
                      placeholder="הזן את שמך המלא"
                      disabled={isLoading}
                      aria-describedby={errors.user_name ? "name-error" : undefined}
                    />
                    {errors.user_name && (
                      <p id="name-error" className="mt-2 text-sm text-red-400">{errors.user_name}</p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="user-email"
                      className="block text-sm font-heebo font-medium text-[var(--color-text)] mb-3"
                    >
                      כתובת אימייל *
                    </label>
                    <input
                      id="user-email"
                      type="email"
                      value={formData.user_email}
                      onChange={(e) => handleInputChange('user_email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded bg-[var(--color-bg)] text-[var(--color-text)] font-heebo focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-all ${
                        errors.user_email ? 'border-red-500' : 'border-[var(--color-gold-border)]'
                      }`}
                      placeholder="example@email.com"
                      disabled={isLoading}
                      aria-describedby={errors.user_email ? "email-error" : undefined}
                    />
                    {errors.user_email && (
                      <p id="email-error" className="mt-2 text-sm text-red-400">{errors.user_email}</p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="user-phone"
                      className="block text-sm font-heebo font-medium text-[var(--color-text)] mb-3"
                    >
                      מספר טלפון *
                    </label>
                    <input
                      id="user-phone"
                      type="tel"
                      value={formData.user_phone}
                      onChange={(e) => handleInputChange('user_phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded bg-[var(--color-bg)] text-[var(--color-text)] font-heebo focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-all ${
                        errors.user_phone ? 'border-red-500' : 'border-[var(--color-gold-border)]'
                      }`}
                      placeholder="050-1234567"
                      disabled={isLoading}
                      aria-describedby={errors.user_phone ? "phone-error" : undefined}
                    />
                    {errors.user_phone && (
                      <p id="phone-error" className="mt-2 text-sm text-red-400">{errors.user_phone}</p>
                    )}
                  </div>

                  {/* Consent Checkbox */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => handleInputChange('consent', e.target.checked)}
                        className="mt-1 w-4 h-4 text-[var(--color-gold)] bg-[var(--color-bg)] border-[var(--color-gold-border)] rounded focus:ring-[var(--color-gold)] focus:ring-2"
                        disabled={isLoading}
                        aria-describedby={errors.consent ? "consent-error" : "consent-help"}
                      />
                      <span className="text-sm font-heebo text-[var(--color-muted)] leading-relaxed">
                        אני מאשר/ת קבלת עדכונים ושיווק מ-SodaStream, ומסכים/ה ל
                        <a 
                          href="/terms" 
                          className="text-[var(--color-gold)] hover:underline focus:underline focus:outline-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          תנאי השימוש
                        </a>
                        {' '}ול
                        <a 
                          href="/privacy" 
                          className="text-[var(--color-gold)] hover:underline focus:underline focus:outline-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          מדיניות הפרטיות
                        </a>
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="mt-2 text-sm text-red-400">{errors.consent}</p>
                    )}
                    <p id="consent-help" className="mt-2 text-xs text-[var(--color-muted)]/70 font-heebo">
                      * נדרש לצורך יצירת האמנות ושליחתה אליך
                    </p>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      className="flex-1 px-6 py-3 text-sm font-heebo font-medium text-[var(--color-muted)] bg-transparent border border-[var(--color-gold-border)] rounded hover:bg-[var(--color-gold-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50 transition-all"
                      onClick={onClose}
                      disabled={isLoading}
                      aria-label="ביטול יצירת האמנות"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !formData.consent}
                      className="flex-1 px-6 py-3 text-sm font-heebo font-medium text-black bg-[var(--color-gold)] border border-transparent rounded hover:bg-[var(--color-gold)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label={isLoading ? 'יוצר יצירת אמנות...' : 'צור יצירת אמנות'}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          יוצר...
                        </span>
                      ) : (
                        'צור יצירה'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-[var(--color-muted)]/70 font-heebo leading-relaxed">
                    הפרטים ישמרו בהתאם למדיניות הפרטיות של SodaStream<br />
                    ויהיו זמינים לצורך יצירת האמנות ושליחתה אליך
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
