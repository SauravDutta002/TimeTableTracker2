import { useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { diffCuimsData } from '../utils/diffing';

// Never replace the last good data with an empty fetch; keep showing the previous attendance.
const hasAttendance = (data) => !!(data && data.attendance && data.attendance.subjects && data.attendance.subjects.length > 0);

/**
 * Hook to automatically sync data from the backend and trigger notifications.
 */
export default function useDataSync(cuimsToken, cuimsData, setCuimsData, setCuimsToken, onUpdated) {
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

      if (response.ok && result.success && hasAttendance(result.data)) {
        const newData = result.data;

        // Keep showing the previous day-wise dots until fresh ones are fetched
        const oldFull = cuimsData?.attendance?.fullAttendance;
        if (oldFull && newData.attendance) {
          newData.attendance.fullAttendance = oldFull;
          newData.attendance.fullStale = true;
        }

        // Compare with old data
        if (cuimsData) {
          const notifications = diffCuimsData(cuimsData, newData);
          
          if (notifications.length > 0 && Notification.permission === 'granted') {
            notifications.forEach((notif) => {
              const options = {
                body: notif.body,
                icon: '/icons/icon-192.png',
              };
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(notif.title, options);
                }).catch(() => new Notification(notif.title, options));
              } else {
                new Notification(notif.title, options);
              }
            });
          }
        }

        localStorage.setItem("cuims_data", JSON.stringify(newData));
        setCuimsData(newData);
        if (onUpdated) onUpdated();
      } else {
        // Session likely expired, attempt auto-login if credentials exist
        const credsStr = localStorage.getItem("cuims_creds");
        if (credsStr) {
          try {
            const creds = JSON.parse(credsStr);
            const loginResp = await fetch(`${API_BASE_URL}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: creds.uid, password: creds.password })
            });
            const loginRes = await loginResp.json();
            if (loginResp.ok && loginRes.success && hasAttendance(loginRes.data)) {
              console.log('[Sync] Auto-login successful');
              localStorage.setItem("cuims_token", loginRes.token);
              localStorage.setItem("cuims_data", JSON.stringify(loginRes.data));
              if (setCuimsToken) setCuimsToken(loginRes.token);
              setCuimsData(loginRes.data);
              if (onUpdated) onUpdated();
            }
          } catch (autoErr) {
            console.error('[Sync] Auto-login failed:', autoErr);
          }
        }
      }
    } catch (err) {
      console.error('[Sync] Failed to refresh data:', err);
    } finally {
      isSyncing.current = false;
    }
  }, [cuimsToken, cuimsData, setCuimsData, setCuimsToken, onUpdated]);

  // Removed the 5-minute interval to be extremely safe with university servers.
  // Data will now only sync when you open the app (visibilitychange).

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
