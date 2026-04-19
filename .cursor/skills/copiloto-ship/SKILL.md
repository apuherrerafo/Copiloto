---
name: copiloto-ship
description: >-
  Guía de siguientes pasos para la PWA Copiloto Metabólico (Next.js, Vercel,
  Anthropic, PWA, contenido biohack). Usar cuando el usuario pregunte qué sigue,
  cómo publicar, checklist post-dev, o "opciones a seguir" después de implementar
  features en copiloto-metabolico.
---

# Copiloto ship — qué sigue (opciones)

Cuando el usuario pida **qué sigue**, **próximos pasos**, o **opciones**, presentar esta lista como **opciones numeradas o con letras** (A/B/C) y ejecutar en el repo solo lo que pida.

## A — Producción (Vercel)

1. Código en GitHub (rama principal estable).
2. Vercel → Import Project → mismo repo.
3. Variables: `ANTHROPIC_API_KEY` (obligatoria para chat). Opcional: `ANTHROPIC_CHAT_MODEL`.
4. Deploy; abrir URL HTTPS; probar `/`, `/copiloto`, `POST /api/chat` desde la app.
5. En el móvil: "Instalar app" / añadir a inicio desde esa URL.

## B — Copiloto estable en local

1. `.env.local` con `ANTHROPIC_API_KEY`.
2. `npm run dev` → `http://localhost:3000`.
3. PWA en dev suele estar desactivada (`next-pwa`); la instalación real es en producción.

## C — Contenido biohack + tiroides

1. Generar o revisar texto (p. ej. con Gemini) con tono conservador y disclaimer.
2. Pegar/condensar en `lib/knowledge/biohack-tiroides.ts` (`BIOHACK_TIROIDES_SNIPPET`), manteniendo tamaño razonable para tokens.
3. Commit + push; Vercel redeploy si aplica.

## D — Calidad y producto (cuando toque)

1. Probar flujos: registrar, historial, notificaciones, feed por filtro (incl. Biohack).
2. Revisar saldo y límites de Anthropic si el chat falla.
3. Mejoras UX: más páginas con motion/tokens si se pide explícitamente.

## Referencias en el repo

- API chat: `app/api/chat/route.ts` (ventana de mensajes, modelo por env).
- System + biohack: `lib/protocols/julio-profile.ts`, `lib/knowledge/biohack-tiroides.ts`.
- Ejemplo env: `.env.example`.
- Feed: `app/api/news/route.ts`, filtros en `components/ui/NewsFeed.tsx`.

## Notas

- Créditos de Cursor/Claude Code no son la API de la app; el chat usa `ANTHROPIC_API_KEY` en servidor.
- Sin deploy, `/api/chat` no existe en el teléfono aunque la shell PWA abra páginas cacheadas.
