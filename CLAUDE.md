# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Liftzr** - iOS-only fitness/workout tracking app built with React Native + Expo.

> **Simplified version for university thesis (TFG)**

### Technology Stack

- **Framework**: React Native + Expo (iOS exclusive)
- **State**: Legend-State (offline-first + MMKV persistence)
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind CSS)
- **UI**: React Native Reusables (@rn-primitives)

## Development Commands

```bash
npm run full-check    # Check TS, linter, prettier issues
npm run full-fix      # Auto-fix issues
npm run prettier-fix  # Apply formatting fixes
```

## Project Structure

```
components/    → UI components (modular structure)
hooks/         → Data, workout, achievements, UI hooks
lib/           → Legend-State stores, services, utils
data/          → Static JSON data (exercises, muscle groups)
assets/        → Images and fonts
```

**Path Alias**: `~/` resolves to project root

## Critical Rules

### Absolute Prohibitions

- **NEVER** run `npm start`, `npm run ios`, `npm run dev-build`
- **NEVER** create types outside `~/types/index.ts`
- **NEVER** use dynamic imports

**If changes require app restart → ASK USER to do it**

### Code Standards

- TypeScript strict mode required
- Remove unused variables completely (don't underscore!)
- Use `gap` instead of `space` in Tailwind
- Import types from `~/types` only

## Key Architecture Notes

- **Offline-first**: All data stored locally via Legend-State + MMKV
- **No cloud/sync**: This is a fully offline app
- **No authentication**: No login required
- **Free app**: No payments or subscriptions

## TFG - Memoria/Teoria

Este proyecto incluye la memoria del Trabajo de Fin de Grado (TFG) de UNIR.

### Documentos de Referencia

| Documento | Ruta | Uso |
|-----------|------|-----|
| **Instrucciones TFE** | `.docs/instrucciones-tfe-unir.md` | Normas y estructura de la universidad |
| **Estilos Word** | `.docs/estilos-word-tfg-unir.md` | Especificaciones tecnicas de formato |
| **Rubrica Evaluacion** | `.docs/rubrica-evaluacion-tfg.md` | Criterios de calificacion del TFG |

### Reglas para Modificar la Memoria

- **SIEMPRE** consulta `.docs/instrucciones-tfe-unir.md` antes de redactar contenido
- **SIEMPRE** consulta `.docs/estilos-word-tfg-unir.md` antes de usar el MCP de Word
- **SIEMPRE** consulta `.docs/rubrica-evaluacion-tfg.md` para asegurar calidad del contenido
- **SIEMPRE** respeta los estilos de la plantilla UNIR (Heading 1, Heading 2, etc.)

### Agente TFG Memory

**Usar el agente `tfg-memory`** (`.claude/agents/tfg-memory.md`) cuando trabajes en teoria/memoria.

Triggers: `guardar en tfg`, `memoria tfg`, `contexto tfg`, `buscar en tfg`, `estado tfg`

### Sistemas de Tracking (Mantener Actualizados)

| Sistema | Proyecto | Proposito |
|---------|----------|-----------|
| **Basic Memory MCP** | `tfg` | Contexto, estado, notas, conocimiento acumulado |
| **Linear MCP** | `Teoria` | Tracking de tareas, issues, progreso |

**IMPORTANTE:** Cuando trabajes en TFG/memoria/teoria:
- **Usa el agente `tfg-memory`** para guardar/buscar conocimiento
- Actualiza Linear con el progreso de las tareas
- Guarda contexto importante en Basic Memory (proyecto `tfg`)
- Sincroniza estado entre ambos sistemas
- Al finalizar sesion, actualiza el estado en Basic Memory

### Archivo de Trabajo

```
/Users/michel/Documents/UNIR/TFG/MCP Word/entrega1.docx
```
