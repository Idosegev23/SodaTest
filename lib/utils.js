import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Google Analytics 4 Tracking Functions
export const trackPageView = () => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }
};

export const trackFormSubmit = (elementType = 'Enso gallery IL', elementId = undefined) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', 'form_submit', {
      element_type: elementType,
      element_id: elementId,
      page_title: document.title,
      page_location: window.location.href
    });
  }
};
