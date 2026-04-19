'use client';

import { useEffect } from 'react';
import { getNotificationStatus, scheduleProtocolNotifications } from '@/lib/notifications/schedule';

export default function NotificationInit() {
  useEffect(() => {
    if (getNotificationStatus() === 'granted') {
      scheduleProtocolNotifications();
    }
  }, []);

  return null;
}
