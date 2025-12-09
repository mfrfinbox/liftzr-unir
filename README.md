# Liftzr - Aplicacion de Registro de Entrenamientos

> Trabajo de Fin de Grado - Universidad Internacional de La Rioja (UNIR)
> Grado en Ingenieria Informatica

## Descripcion del Proyecto

**Liftzr** es una aplicacion movil iOS para el registro y seguimiento de entrenamientos de fuerza. Desarrollada como proyecto practico del Trabajo de Fin de Grado, implementa una arquitectura offline-first que permite a los usuarios registrar sus sesiones de entrenamiento sin necesidad de conexion a internet.

### Objetivo

Demostrar la viabilidad de desarrollar aplicaciones moviles nativas de alta calidad utilizando tecnologias multiplataforma (React Native + Expo), con enfasis en:

- Arquitectura offline-first
- Gestion de estado reactivo
- Experiencia de usuario fluida
- Patrones de diseno escalables

## Funcionalidades Principales

### Registro de Entrenamientos
- Registro de series con repeticiones y peso
- Deteccion automatica de Records Personales (PRs)
- Historial completo de entrenamientos
- Cronometro integrado con seguimiento de descansos

### Gestion de Rutinas
- Creacion de rutinas personalizadas
- Modo "Entrenamiento Rapido" para sesiones espontaneas
- Catalogo de +100 ejercicios predefinidos
- Creacion de ejercicios personalizados

### Estadisticas
- Vista semanal, mensual y anual
- Historial de Records Personales
- Mapa de calor por grupos musculares
- Visualizacion de actividad anual

### Configuracion
- Temas: Oscuro, Claro y Alto Contraste
- Unidades: Sistema metrico (kg) o imperial (lbs)
- Soporte multiidioma (Espanol, Ingles)

## Stack Tecnologico

| Categoria | Tecnologia | Version |
|-----------|------------|---------|
| Framework | React Native | 0.81 |
| Plataforma | Expo | 54 |
| Lenguaje | TypeScript | 5.9 |
| UI Library | React | 19 |
| Estado | Legend-State | 3.0 |
| Persistencia | MMKV | 3.3 |
| Navegacion | Expo Router | 6.0 |
| Estilos | NativeWind (Tailwind CSS) | 4.0 |
| Componentes UI | React Native Reusables | 1.1 |

## Arquitectura

### Patron Offline-First

```
Accion Usuario → Estado Local (Legend-State)
              → Persistencia MMKV (automatica)
              → Disponible inmediatamente sin conexion
```

### Estructura del Proyecto

```
liftzr/
├── app/                    # Pantallas (Expo Router)
│   ├── (app)/(tabs)/      # Navegacion inferior (Home, Stats, Settings)
│   ├── (app)/(stacks)/    # Navegacion stack (Workout activo, Historial)
│   └── (app)/(modals)/    # Pantallas modales
│
├── components/            # Componentes React
│   ├── ui/               # Primitivos UI reutilizables
│   ├── workout/          # Componentes de entrenamiento
│   ├── home/             # Componentes de pantalla principal
│   └── sheets/           # Bottom sheets
│
├── hooks/                 # Custom hooks
│   ├── data/             # Acceso a datos (Legend-State)
│   ├── workout/          # Logica de entrenamientos
│   └── ui/               # Hooks de interfaz
│
├── lib/                   # Librerias y utilidades
│   ├── legend-state/     # Configuracion de estado
│   │   └── stores/       # Stores: workouts, exercises, PRs
│   ├── services/         # Logica de negocio
│   └── utils/            # Utilidades generales
│
├── data/                  # Datos estaticos
│   ├── exercises.json    # Catalogo de ejercicios
│   └── muscle_groups.json # Grupos musculares
│
├── locales/              # Internacionalizacion
│   ├── es.json           # Espanol
│   └── en.json           # Ingles
│
├── assets/               # Recursos estaticos
│   ├── fonts/            # Tipografias
│   └── icons/            # Iconos de la app
│
└── types/
    └── index.ts          # Tipos TypeScript centralizados
```

## Requisitos del Sistema

### Desarrollo
- Node.js 18+
- Xcode 15+ (para simulador iOS)
- macOS (requerido para desarrollo iOS)

### Ejecucion
- iOS 16.0 o superior
- iPhone (no soporta iPad)

## Instalacion y Ejecucion

```bash
# Clonar repositorio
git clone <url-repositorio>
cd liftzr

# Instalar dependencias
npm install

# Verificar codigo
npm run full-check
```

> **Nota:** La ejecucion de la aplicacion requiere un entorno de desarrollo iOS configurado (Xcode + Simulador).

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run full-check` | Ejecuta Prettier, ESLint y TypeScript |
| `npm run full-fix` | Corrige automaticamente errores de formato y linting |
| `npm run prettier-fix` | Aplica formato con Prettier |

## Decisiones de Diseno

### Por que Offline-First?
- Garantiza disponibilidad durante entrenamientos (gimnasios con mala cobertura)
- Mejor rendimiento al evitar latencia de red
- Experiencia de usuario consistente

### Por que Legend-State?
- Reactividad automatica sin boilerplate
- Persistencia integrada con MMKV
- Rendimiento optimizado para React Native

### Por que iOS Exclusivo?
- Simplificacion del alcance para el TFG
- Optimizacion especifica de la plataforma
- Uso de APIs nativas de iOS (Haptics, Notificaciones)

## Alcance del Proyecto

Este proyecto es una version adaptada para el TFG. El desarrollo original incluia funcionalidades adicionales que excedian el alcance academico requerido, por lo que se opto por simplificar la aplicacion para centrar el trabajo en los aspectos fundamentales de la arquitectura y desarrollo movil.

**Funcionalidades excluidas del alcance del TFG:**
- Autenticacion de usuarios
- Sincronizacion en la nube
- Sistema de logros y gamificacion
- Compras in-app

Esta simplificacion permite enfocarse en demostrar las competencias tecnicas esenciales sin complejidad innecesaria para los objetivos academicos.

## Autor

**Michel Fernandez**
Estudiante de Grado en Ingenieria Informatica
Universidad Internacional de La Rioja (UNIR)

## Licencia

Proyecto academico - Todos los derechos reservados.

---

*Desarrollado como parte del Trabajo de Fin de Grado - UNIR 2024/2025*
