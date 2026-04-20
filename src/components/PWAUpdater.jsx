import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

/**
 * PWAUpdater
 * Shows a small toast when a new version is deployed.
 * With registerType:'autoUpdate', the SW updates silently in the background.
 * This component just shows a "Reload to apply update" prompt.
 */
const PWAUpdater = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 seconds while app is open
      r && setInterval(() => r.update(), 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(70px + env(safe-area-inset-bottom, 0px) + 12px)',
      left: '12px',
      right: '12px',
      zIndex: 8000,
      background: '#0f2133',
      color: 'white',
      borderRadius: '16px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'fadeUp .35s ease-out both',
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>
          Update available
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
          A new version of Leka POS is ready
        </p>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#3379A7',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <RefreshCw size={14} /> Reload
      </button>
    </div>
  );
};

export default PWAUpdater;
