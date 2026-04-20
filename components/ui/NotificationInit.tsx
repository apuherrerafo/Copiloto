'use client';

import { useEffect } from 'react';
import { getNotificationStatus, scheduleProtocolNotifications } from '@/lib/notifications/schedule';
import { startSmartCopilotAlerts } from '@/lib/notifications/smart-copilot';

export default function NotificationInit() {
  useEffect(() => {
    if (getNotificationStatus() !== 'granted') return;
    const stopProtocol = scheduleProtocolNotifications();
    const stopSmart = startSmartCopilotAlerts();
    return () => {
      stopProtocol();
      stopSmart();
    };
  }, []);

  return null;
}
