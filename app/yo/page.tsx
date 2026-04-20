'use client';

import { useEffect, useState, useRef, useMemo, type ChangeEvent } from 'react';
import {
  requestNotificationPermission,
  scheduleProtocolNotifications,
  getNotificationStatus,
  sendTestNotification,
  getProtocolAlertScheduleRows,
} from '@/lib/notifications/schedule';
import { useHypoSession } from '@/components/layout/AppShell';
import { readSession, saveSession } from '@/lib/auth/session';
import { compressImageToDataUrl } from '@/lib/images/compress-avatar';
import { LEVO_DOSE_LABEL } from '@/lib/brand';
import { getProtocolSnapshot } from '@/lib/protocols/julio';
import {
  DEFAULT_PROTOCOL_SETTINGS,
  getSmartDefaultSettings,
  sanitizeProtocolSettings,
  type UserProtocolSettings,
} from '@/lib/protocols/user-protocol';
import { pushProfileAndProtocol } from '@/lib/sync/push';
import { collectProtocolChecksForSync } from '@/lib/sync/protocol-collect';
import { useAppLoading } from '@/contexts/app-loading';

interface Profile {
  name: string;
  age?: string | number | null;
  weight: string;
  height: string;
  goal: string;
  notes: string;
  medication?: string | null;
  medicationMcg?: string | number | null;
  protocolSettings?: UserProtocolSettings;
}

export default function YoPage() {
  const { session, refresh, logout } = useHypoSession();
  const { show: showLoader, hide: hideLoader } = useAppLoading();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    weight: '',
    height: '',
    goal: 'Metabolic control and body composition',
    notes: '',
    protocolSettings: { ...DEFAULT_PROTOCOL_SETTINGS },
  });
  const [saved, setSaved] = useState(false);
  const [scheduleSuggested, setScheduleSuggested] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [testNotifHint, setTestNotifHint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('copiloto_profile');
      if (stored) {
        const p = JSON.parse(stored) as Profile;
        const hasSavedSchedule = !!p.protocolSettings;
        setProfile({
          ...p,
          protocolSettings: hasSavedSchedule
            ? sanitizeProtocolSettings(p.protocolSettings!)
            : getSmartDefaultSettings(),
        });
        setScheduleSuggested(!hasSavedSchedule);
      } else {
        // Brand-new user — anchor to phone time
        setProfile(prev => ({ ...prev, protocolSettings: getSmartDefaultSettings() }));
        setScheduleSuggested(true);
      }
    } catch {}
    setNotifStatus(getNotificationStatus());
  }, []);

  useEffect(() => {
    if (session?.name) {
      setProfile((p) => ({ ...p, name: session.name }));
    }
  }, [session?.name]);

  useEffect(() => {
    function onStorageSync() {
      try {
        const stored = localStorage.getItem('copiloto_profile');
        if (stored) {
          const p = JSON.parse(stored) as Profile;
          const hasSavedSchedule = !!p.protocolSettings;
          setProfile({
            ...p,
            protocolSettings: hasSavedSchedule
              ? sanitizeProtocolSettings(p.protocolSettings!)
              : getSmartDefaultSettings(),
          });
          setScheduleSuggested(!hasSavedSchedule);
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('hypo-storage-sync', onStorageSync);
    return () => window.removeEventListener('hypo-storage-sync', onStorageSync);
  }, []);

  async function save() {
    const toSave: Profile = {
      ...profile,
      protocolSettings: sanitizeProtocolSettings(profile.protocolSettings ?? {}),
    };
    localStorage.setItem('copiloto_profile', JSON.stringify(toSave));
    setProfile(toSave);
    const s = readSession();
    if (s) {
      saveSession({
        ...s,
        name: toSave.name.trim() || s.name,
      });
      refresh();
    }
    window.dispatchEvent(new Event('hypo-storage-sync'));
    showLoader({
      title: 'Syncing profile…',
      subtitle: 'Uploading your settings to the cloud.',
    });
    try {
      await pushProfileAndProtocol(toSave, collectProtocolChecksForSync());
    } finally {
      hideLoader();
    }
    if (getNotificationStatus() === 'granted') scheduleProtocolNotifications();
    setScheduleSuggested(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const protocolSanitized = useMemo(
    () => sanitizeProtocolSettings(profile.protocolSettings ?? {}),
    [profile.protocolSettings],
  );
  const protocolSnap = useMemo(() => getProtocolSnapshot(protocolSanitized), [protocolSanitized]);
  const notificationScheduleRows = useMemo(
    () => getProtocolAlertScheduleRows(protocolSanitized),
    [protocolSanitized],
  );

  function patchProtocol(partial: Partial<UserProtocolSettings>) {
    setProfile(prev => ({
      ...prev,
      protocolSettings: sanitizeProtocolSettings({
        ...DEFAULT_PROTOCOL_SETTINGS,
        ...prev.protocolSettings,
        ...partial,
      }),
    }));
  }

  async function onAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const prev = readSession();
      const nm = profile.name.trim() || session?.name || 'You';
      saveSession({
        name: prev?.name ?? nm,
        email: prev?.email ?? session?.email,
        avatarDataUrl: dataUrl,
        createdAt: prev?.createdAt ?? Date.now(),
      });
      refresh();
      window.dispatchEvent(new Event('hypo-storage-sync'));
    } catch {
      /* ignore */
    }
  }

  async function handleNotifications() {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) scheduleProtocolNotifications();
    window.dispatchEvent(new Event('hypo-storage-sync'));
  }

  function handleTestNotification() {
    const r = sendTestNotification();
    if (r.ok) {
      setTestNotifHint('If nothing appeared, check Focus / Do Not Disturb and the browser’s site permissions.');
    } else if (r.reason === 'not_granted') {
      setTestNotifHint('Enable alerts first with the button above.');
    } else {
      setTestNotifHint('This browser may not support notifications here.');
    }
    window.setTimeout(() => setTestNotifHint(null), 7000);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl text-ink">My profile</h1>
        <p className="text-xs text-muted mt-1">HypoCopilot uses this to give you science-based guidance</p>
      </div>

      <div className="px-6 space-y-5 pb-8">
        <div className="flex flex-col items-center py-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarPick}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
            aria-label="Change profile photo"
          >
            {session?.avatarDataUrl || session?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.avatarDataUrl ?? session.avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2 border-hairline shadow-soft"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sage/15 border border-sage/25 flex items-center justify-center text-sage font-serif italic text-2xl">
                {(session?.name ?? 'You').slice(0, 1).toUpperCase()}
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 text-xs font-medium text-sage underline-offset-2 hover:underline"
          >
            Change photo
          </button>
          <p className="text-sm font-semibold text-ink mt-2">{session?.name}</p>
          {session?.email ? <p className="text-xs text-muted">{session.email}</p> : null}
        </div>

        <a
          href="/api/report"
          className="block w-full py-3 rounded-xl border border-hairline text-center text-sm font-medium text-sage hover:bg-sage/5 transition-colors"
        >
          Download report (JSON) — cloud memory
        </a>

        {/* My schedule — aligned with your clinician; drives rings, chat, and alert times */}
        <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">My schedule</p>
            {scheduleSuggested ? (
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2 leading-relaxed">
                Suggested from your current local time — confirm or adjust, then save.
              </p>
            ) : (
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Set times that match your plan with your doctor. This app does not change medication dose — only habits
                and logging.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Levothyroxine — hour</label>
              <input
                type="number"
                inputMode="numeric"
                min={4}
                max={14}
                value={protocolSanitized.levoHour}
                onChange={e => patchProtocol({ levoHour: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Levothyroxine — min</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={protocolSanitized.levoMinute}
                onChange={e => patchProtocol({ levoMinute: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Break fast (earliest meal)</label>
              <input
                type="number"
                inputMode="numeric"
                min={5}
                max={14}
                value={protocolSanitized.breakFastHour}
                onChange={e => patchProtocol({ breakFastHour: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Last meal (window ends)</label>
              <input
                type="number"
                inputMode="numeric"
                min={17}
                max={23}
                value={protocolSanitized.eatingWindowEndHour}
                onChange={e => patchProtocol({ eatingWindowEndHour: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Evening fast starts (~last meal)</label>
              <input
                type="number"
                inputMode="numeric"
                min={16}
                max={23}
                value={protocolSanitized.eveningFastStartHour}
                onChange={e => patchProtocol({ eveningFastStartHour: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Target fast (hours)</label>
              <input
                type="number"
                inputMode="numeric"
                min={12}
                max={20}
                value={protocolSanitized.targetFastHours}
                onChange={e => patchProtocol({ targetFastHours: Number(e.target.value) })}
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Max fast without clinician ok (hours)</label>
            <input
              type="number"
              inputMode="numeric"
              min={12}
              max={22}
              value={protocolSanitized.maxFastHours}
              onChange={e => patchProtocol({ maxFastHours: Number(e.target.value) })}
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
            />
          </div>
        </div>

        {/* Health protocol card — live preview */}
        <div className="bg-sage/10 border border-sage/20 rounded-2xl px-5 py-4">
          <p className="text-xs text-sage uppercase tracking-widest font-semibold mb-3">Active protocol</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>💊</span>
              <span className="text-ink">
                Levothyroxine {LEVO_DOSE_LABEL} — {protocolSnap.levothyroxine.time} (fasted, water)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🚶</span>
              <span className="text-ink">
                Post-lunch walk ~{notificationScheduleRows[3]?.time ?? '—'} · post-dinner ~
                {notificationScheduleRows[5]?.time ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🍽️</span>
              <span className="text-ink">
                Eating window: {protocolSnap.fastBreak.time} — {protocolSnap.lastMeal.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span className="text-ink">
                {protocolSnap.fast.durationHours}h target fast · {protocolSnap.fast.maxHours}h max
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🫀</span>
              <span className="text-ink">Condition: Hypothyroidism</span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4 space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Personal details</p>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Name</label>
            <input
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Current weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={profile.weight}
                onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))}
                placeholder="0.0"
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Height (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={profile.height}
                onChange={e => setProfile(p => ({ ...p, height: e.target.value }))}
                placeholder="170"
                className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Goal</label>
            <input
              value={profile.goal}
              onChange={e => setProfile(p => ({ ...p, goal: e.target.value }))}
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Notes for the copilot (optional)</label>
            <textarea
              value={profile.notes}
              onChange={e => setProfile(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Allergies, extra conditions, preferences…"
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => void save()}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-sage/20 text-sage' : 'bg-sage text-white hover:bg-sage/90'
            }`}
          >
            {saved ? '✓ Saved' : 'Save profile & schedule'}
          </button>
        </div>

        {/* Notifications */}
        <div id="alertas" className="bg-surface border border-gray-100 rounded-2xl px-5 py-4 scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Protocol alerts</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              notifStatus === 'granted' ? 'bg-sage/10 text-sage' :
              notifStatus === 'denied' ? 'bg-coral/10 text-coral' :
              'bg-gray-100 text-gray-400'
            }`}>
              {notifStatus === 'granted' ? 'Active' :
               notifStatus === 'denied' ? 'Blocked' :
               notifStatus === 'unsupported' ? 'Unsupported' : 'Off'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {notificationScheduleRows.map(n => (
              <div key={`${n.time}-${n.label}`} className="flex items-center gap-3 text-sm">
                <span>{n.icon}</span>
                <span className="text-gray-400 w-12 shrink-0 font-mono text-xs">{n.time}</span>
                <span className="text-ink">{n.label}</span>
              </div>
            ))}
          </div>

          {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
            <button
              onClick={handleNotifications}
              className="w-full py-3 rounded-xl border border-sage text-sage font-semibold text-sm hover:bg-sage/5 transition-colors"
            >
              Enable alerts
            </button>
          )}

          {notifStatus === 'granted' && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted leading-relaxed">
                Smart copilot alerts watch your fasting window and eating window (e.g. if you have not logged a meal and
                you are near the {protocolSnap.fast.maxHours} h mark, or when dinner time is closing). They complement the schedule
                above — habits only, not medical advice. Bring patterns to your doctor so dose and diet stay
                clinician-led.
              </p>
              <p className="text-[11px] text-muted leading-relaxed">
                Reminders need the app running in the background; fully closing it pauses timers until you open again.
              </p>
              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full py-3 rounded-xl border border-hairline text-ink font-semibold text-sm hover:bg-surface/80 transition-colors"
              >
                Send test notification now
              </button>
              <button
                type="button"
                onClick={() => scheduleProtocolNotifications()}
                className="w-full py-3 rounded-xl bg-sage/10 text-sage font-semibold text-sm"
              >
                ✓ Reschedule for today
              </button>
              {testNotifHint ? (
                <p className="text-[11px] text-muted text-center">{testNotifHint}</p>
              ) : null}
            </div>
          )}

          {notifStatus === 'denied' && (
            <p className="text-xs text-coral text-center">
              Notifications blocked. Enable them in iPhone Settings → Safari → Notifications.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 rounded-xl border border-coral/35 text-coral font-semibold text-sm hover:bg-coral/5 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
