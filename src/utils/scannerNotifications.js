export function createScannerNotifications(toast, scannerName) {
  const id = `scanner-${scannerName}`;
  return {
    start: name => toast.loading(`Scanning "${name}"…`, { id }),
    success: message => toast.success(message, { id, duration: 2500 }),
    warning: message => toast(message, { id, icon: '⚠️', duration: 5000 }),
    info: message => toast(message, { id, icon: 'ℹ️', duration: 3000 }),
    error: message => toast.error(message, { id, duration: 5000 }),
    clear: () => toast.remove(id),
  };
}
