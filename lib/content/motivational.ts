/**
 * Mensajes motivacionales rotativos para el header de la home.
 * Se agrupan por momento del día y se seleccionan por combinación fecha+índice
 * para variar cada día sin repetir demasiado.
 */

type Slot = 'manana' | 'tarde' | 'noche';

const MESSAGES: Record<Slot, string[]> = {
  manana: [
    'El día empieza contigo. 🌱',
    'Agua, sol y constancia — eso es todo. ☀️',
    'Tu pastilla a las 11. Mientras, solo agua.',
    'Cada mañana que registras, ganas datos. 📊',
    'Cuerpo bien descansado = tiroides feliz.',
    'Hoy es otro día para ser constante.',
    'El ayuno sigue trabajando por ti.',
    'Un día a la vez. Eso funciona.',
    'Tu protocolo es simple. La constancia, el secreto.',
    'Desayuno a las 12. Por ahora, a seguir. 💪',
    'La luz matutina ya está resincronizando tu reloj interno.',
    'Sal 5 min al sol antes de las 11. Gratis y poderoso.',
  ],
  tarde: [
    '¿Ya caminaste después de comer? 🚶',
    'Ventana abierta hasta las 20:00. Aprovéchala bien.',
    'Una caminata de 10 min ahora vale mucho.',
    'Medio día completo. ¿Cómo vas con el protocolo?',
    'La glucosa te lo agradecerá si caminas ahora.',
    'Tarde productiva = noche tranquila.',
    'Tu cuerpo procesa mejor con movimiento post-comida.',
    '¿Tomaste la pastilla esta mañana? Bien hecho. 🙌',
    'Cada comida dentro de ventana suma. No es perfección, es tendencia.',
    'Un vaso de agua ahora no rompe nada. Al contrario.',
    'La constancia de hoy es la energía de mañana.',
    'Hidratación + movimiento + ventana. La tríada.',
  ],
  noche: [
    'Cierra la cocina a las 20:00 y gana 16h. 🌙',
    'Ayuno activado. El cuerpo empieza a limpiar.',
    'Buenas noches — mañana continúa el ritmo.',
    'El sueño convierte T4 en T3. Duerme bien.',
    'La constancia de hoy importa más que la perfección.',
    'Cena terminada. Ahora solo agua y descanso.',
    'Un ayuno bien hecho es como reiniciar el sistema. 🔄',
    'Tu microbiota trabaja de noche. Dale fibra vegetal.',
    '¿Caminata post-cena? Son solo 10 min. Vale la pena. 🚶',
    'Mañana es otro día para ser constante.',
    'El cuerpo se repara mientras duermes. Buenas noches.',
    'Que el descanso sea tan bueno como tu protocolo.',
  ],
};

function getSlot(hour: number): Slot {
  if (hour < 12) return 'manana';
  if (hour < 20) return 'tarde';
  return 'noche';
}

function getDayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function getMotivationalMessage(now = new Date()): string {
  const slot = getSlot(now.getHours());
  const pool = MESSAGES[slot];
  // Combina día del año + minutos para variar dentro del mismo día si recargas
  const idx = (getDayOfYear(now) * 3 + Math.floor(now.getMinutes() / 20)) % pool.length;
  return pool[idx]!;
}
