// Toast notification store using Svelte 5 runes

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

// Store state
let toasts = $state<Toast[]>([]);

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Actions
function show(message: string, variant: ToastVariant = 'info', duration: number = 4000): string {
  const id = generateId();
  const toast: Toast = { id, message, variant, duration };

  toasts = [...toasts, toast];

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      dismiss(id);
    }, duration);
  }

  return id;
}

function success(message: string, duration?: number): string {
  return show(message, 'success', duration);
}

function error(message: string, duration?: number): string {
  return show(message, 'error', duration ?? 6000);
}

function warning(message: string, duration?: number): string {
  return show(message, 'warning', duration);
}

function info(message: string, duration?: number): string {
  return show(message, 'info', duration);
}

function dismiss(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
}

function dismissAll(): void {
  toasts = [];
}

// Export store and actions
export const toastStore = {
  get toasts() {
    return toasts;
  },
  show,
  success,
  error,
  warning,
  info,
  dismiss,
  dismissAll,
};
