import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function UserDetailsModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: ''
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    פרטים ליצירת האומנות
                  </Dialog.Title>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      value={formData.user_name}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.user_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="הזן את שמך המלא"
                      disabled={isLoading}
                    />
                    {errors.user_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כתובת אימייל *
                    </label>
                    <input
                      type="email"
                      value={formData.user_email}
                      onChange={(e) => handleInputChange('user_email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.user_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                      disabled={isLoading}
                    />
                    {errors.user_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.user_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מספר טלפון *
                    </label>
                    <input
                      type="tel"
                      value={formData.user_phone}
                      onChange={(e) => handleInputChange('user_phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.user_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="050-1234567"
                      disabled={isLoading}
                    />
                    {errors.user_phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.user_phone}</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? 'יוצר...' : 'צור יצירה'}
                    </button>
                  </div>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  * הפרטים ישמרו רק לצורך יצירת האומנות ושליחתה אליך
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
