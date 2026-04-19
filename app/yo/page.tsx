'use client';

import { useEffect, useState } from 'react';
import {
  requestNotificationPermission,
  scheduleProtocolNotifications,
  getNotificationStatus,
} from '@/lib/notifications/schedule';

interface Profile {
  name: string;
  weight: string;
  height: string;
  goal: string;
  notes: string;
}

const NOTIFICATION_SCHEDULE = [
  { time: '10:55', label: 'Levotiroxina (5 min antes)', icon: '💊' },
  { time: '12:00', label: 'Romper ayuno', icon: '🍽️' },
  { time: '19:45', label: 'Última comida (15 min aviso)', icon: '⏰' },
];

export default function YoPage() {
  const [profile, setProfile] = useState<Profile>({
    name: 'Julio Herrera',
    weight: '',
    height: '',
    goal: 'Control metabólico y composición corporal',
    notes: '',
  });
  const [saved, setSaved] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('copiloto_profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
    setNotifStatus(getNotificationStatus());
  }, []);

  function save() {
    localStorage.setItem('copiloto_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleNotifications() {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) scheduleProtocolNotifications();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl text-ink">Mi perfil</h1>
        <p className="text-xs text-gray-400 mt-1">El copiloto usa esta información para aconsejarte mejor</p>
      </div>

      <div className="px-6 space-y-5 pb-8">
        {/* Health protocol card */}
        <div className="bg-sage/10 border border-sage/20 rounded-2xl px-5 py-4">
          <p className="text-xs text-sage uppercase tracking-widest font-semibold mb-3">Protocolo activo</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>💊</span>
              <span className="text-ink">Levotiroxina 75mcg — 11:00 AM (en ayunas)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🍽️</span>
              <span className="text-ink">Ventana de comida: 12:00 — 20:00</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span className="text-ink">Ayuno 16h · Límite máximo 17h</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🫀</span>
              <span className="text-ink">Condición: Hipotiroidismo</span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4 space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Datos personales</p>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Nombre</label>
            <input
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Peso actual (kg)</label>
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
              <label className="text-xs text-gray-400 block mb-1.5">Altura (cm)</label>
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
            <label className="text-xs text-gray-400 block mb-1.5">Objetivo</label>
            <input
              value={profile.goal}
              onChange={e => setProfile(p => ({ ...p, goal: e.target.value }))}
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Notas para el copiloto (opcional)</label>
            <textarea
              value={profile.notes}
              onChange={e => setProfile(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Alergias, condiciones adicionales, preferencias..."
              className="w-full bg-background border border-gray-100 rounded-xl px-3 py-2.5 text-ink text-sm outline-none focus:border-sage transition-colors resize-none"
            />
          </div>

          <button
            onClick={save}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-sage/20 text-sage' : 'bg-sage text-white hover:bg-sage/90'
            }`}
          >
            {saved ? '✓ Guardado' : 'Guardar perfil'}
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-gray-100 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Alertas del protocolo</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              notifStatus === 'granted' ? 'bg-sage/10 text-sage' :
              notifStatus === 'denied' ? 'bg-coral/10 text-coral' :
              'bg-gray-100 text-gray-400'
            }`}>
              {notifStatus === 'granted' ? 'Activas' :
               notifStatus === 'denied' ? 'Bloqueadas' :
               notifStatus === 'unsupported' ? 'No soportado' : 'Desactivadas'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {NOTIFICATION_SCHEDULE.map(n => (
              <div key={n.time} className="flex items-center gap-3 text-sm">
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
              Activar alertas
            </button>
          )}

          {notifStatus === 'granted' && (
            <button
              onClick={() => scheduleProtocolNotifications()}
              className="w-full py-3 rounded-xl bg-sage/10 text-sage font-semibold text-sm"
            >
              ✓ Reprogramar para hoy
            </button>
          )}

          {notifStatus === 'denied' && (
            <p className="text-xs text-coral text-center">
              Notificaciones bloqueadas. Actívalas en Configuración del iPhone → Safari → Notificaciones.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
