import { useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { diffCuimsData } from '../utils/diffing';

/**
 * Hook to automatically sync data from the backend and trigger notifications.
 */
export default function useDataSync(cuimsToken, cuimsData, setCuimsData) {
  const isSyncing = useRef(false);

  const syncData = useCallback(async () => {
    if (!cuimsToken) return;
    if (isSyncing.current) return;

    try {
      isSyncing.current = true;
      const response = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: 'GET',
        headers: {
          'x-session-token': cuimsToken,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const newData = result.data;
        
        // Compare with old data
        if (cuimsData) {
          const notifications = diffCuimsData(cuimsData, newData);
          
          if (notifications.length > 0 && Notification.permission === 'granted') {
            notifications.forEach((msg) => {
              new Notification('CUIMS Update', {
                body: msg,
                icon: '/icons/icon-192x192.png',
              });
            });
          }
        }

        // Update state and storage if changed
        // We do a simple stringify check, or just set it
        localStorage.setItem("cuims_data", JSON.stringify(newData));
        setCuimsData(newData);
      }
    } catch (err) {
      console.error('[Sync] Failed to refresh data:', err);
    } finally {
      isSyncing.current = false;
    }
  }, [cuimsToken, cuimsData, setCuimsData]);

  // Poll every 5 minutes (300000 ms)
  useEffect(() => {
    if (!cuimsToken) return;

    const intervalId = setInterval(syncData, 300000);
    
    return () => clearInterval(intervalId);
  }, [cuimsToken, syncData]);

  // Sync when window becomes visible again
  useEffect(() => {
    if (!cuimsToken) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cuimsToken, syncData]);
}
