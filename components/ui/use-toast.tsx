'use client';

import { useState, useEffect } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

type ToastState = ToastProps & {
  id: string;
  visible: boolean;
};

let toastCounter = 0;

// Simple toast implementation
export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = (props: ToastProps) => {
    const id = `toast-${toastCounter++}`;
    const newToast = { ...props, id, visible: true };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
      );

      // Remove from DOM after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, props.duration || 3000);
  };

  return { toast, toasts };
}

// Export toast function for direct import
export const toast = (props: ToastProps) => {
  // Create and append toast element to body
  const toastContainer =
    document.getElementById('toast-container') || createToastContainer();
  const toastElement = createToastElement(props);
  toastContainer.appendChild(toastElement);

  // Auto remove after duration
  setTimeout(() => {
    toastElement.classList.add('toast-hide');
    setTimeout(() => {
      toastContainer.removeChild(toastElement);
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, props.duration || 3000);
};

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  return container;
}

function createToastElement(props: ToastProps) {
  const { title, description, variant = 'default' } = props;

  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.style.backgroundColor = variant === 'destructive' ? '#f44336' : '#333';
  toast.style.color = '#fff';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.marginTop = '8px';
  toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';

  const titleElement = document.createElement('div');
  titleElement.style.fontWeight = 'bold';
  titleElement.textContent = title;
  toast.appendChild(titleElement);

  if (description) {
    const descElement = document.createElement('div');
    descElement.style.fontSize = '0.875rem';
    descElement.style.marginTop = '4px';
    descElement.textContent = description;
    toast.appendChild(descElement);
  }

  return toast;
}

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .toast { opacity: 1; transform: translateY(0); }
    .toast-hide { opacity: 0; transform: translateY(10px); }
  `;
  document.head.appendChild(style);
}
