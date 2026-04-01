# Pitch Weather

Pitch Weather is a mobile-first React app for finding nearby football and cricket pitches, checking current weather, and estimating how playable each surface is before you travel.

Built with **React + Vite**, **Google Maps JavaScript API (Places)**, **OpenWeatherMap**, and **Open-Meteo**.

---

## Prerequisites

Before running the app, you need:

- **Node.js** (v20 or later)
- An **OpenWeatherMap API key**
- A **Google Maps JavaScript API key** with **Places API** enabled

---

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```bash
VITE_OPENWEATHER_API_KEY=your_openweathermap_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

You can also copy from `.env.example`.

---

## Running The App

Start development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`).

On first load, the app requests geolocation. If permission is denied or unavailable, it falls back to **Mile End, London**.

---

## Available Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Features

| Feature | Description |
| --- | --- |
| **Weather Dashboard** | Full-screen weather view with condition-based background, AQI, UV index, humidity, visibility, wind compass, and rain likelihood |
| **Map-Aware Weather Sync** | Weather refreshes when map center changes (debounced), with coordinate-bucket caching for fast repeat lookups |
| **Hourly Timeline** | Past/current/future weather strip with icon + temperature slots and sunrise/sunset event insertion |
| **Pitch Finder** | Nearby Google Places search for football/cricket pitches with map markers and deduped results |
| **Text Search** | Name-based pitch search biased to user location |
| **Search This Area** | Viewport-based search radius derived from current map bounds |
| **Pitch Details Sheet** | Open/closed status (when available), address, travel-time estimates, website, and directions links |
| **Photo Gallery** | Full-screen image gallery for place photos |
| **Pitch Surface Conditions** | Wetness and muddiness scoring from recent weather history and current conditions |
| **Sport Insights** | Extra football/cricket metrics (for example ball pace, control, swing aid, spin grip) derived from weather + surface conditions |
| **Locate Me** | One-tap return to current/fallback location |

---

## Data Sources

- **OpenWeatherMap**
  - Current weather (`/weather`)
  - 5-day forecast (`/forecast`)
  - Air quality (`/air_pollution`)
  - UV index (`/uvi`)
- **Open-Meteo**
  - Hourly history + forecast (`past_days=2`, `forecast_days=2`)
  - Daily precipitation totals
  - Sunrise/sunset events
- **Google Maps Places**
  - Nearby search
  - Text search
  - Place details (photos, hours, links)

---

## Caching

- **Map weather cache**: keyed by lat/lng rounded to 2 decimals (~1 km bucket), TTL **10 minutes**.
- **Pitch condition cache**: keyed by place ID, TTL **10 minutes**.

---

## Pitch Condition Algorithm

When you open a pitch, the app combines recent weather history with current conditions to score:

- **Wetness** (0-100)
- **Muddiness** (0-100)

### Wetness

| Factor | Weight | Calculation |
| --- | --- | --- |
| Currently raining | 40% | `1.0` if current condition is rain/drizzle/thunderstorm, else `0` |
| Recent rainfall | 35% | 48h rain total capped at 15mm, mapped linearly to 0-1 |
| Humidity | 15% | Current humidity mapped from 50-100% to 0-1 |
| Time since rain | 10% | Inverted drying factor over a 12h window |

### Muddiness

| Factor | Weight | Calculation |
| --- | --- | --- |
| 48h rainfall | 45% | Rain total capped at 20mm, mapped linearly to 0-1 |
| Sustained rain hours | 25% | Rainy hours divided by total hourly window |
| Temperature effect | 15% | Colder temperatures increase muddiness risk |
| Humidity | 15% | Same humidity mapping as wetness |

### Labels

| Percentage | Wetness | Muddiness |
| --- | --- | --- |
| 0-14% | Bone Dry | Firm Ground |
| 15-29% | Probably Fine | Probably Fine |
| 30-49% | Possibly Damp | Possibly Muddy |
| 50-69% | Likely Wet | Likely Muddy |
| 70-100% | Definitely Wet | Definitely Muddy |

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key (with Places enabled) |
