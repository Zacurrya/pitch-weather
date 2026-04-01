# Pitch Weather

A mobile-first web app that helps you find nearby football and cricket pitches, check their real-time opening hours, and see how wet or muddy the ground is likely to be before you travel.

Built with **React + Vite**, **Google Maps JavaScript API**, **OpenWeatherMap**, and **Open-Meteo**.

---

## Prerequisites

Before running the app, you will need:

- **Node.js** (v20 or later) - download from [nodejs.org](https://nodejs.org)
- An **OpenWeatherMap API key** - register for free at [openweathermap.org](https://openweathermap.org/api)
- A **Google Maps JavaScript API key** with the **Places library** enabled - create one at [console.cloud.google.com](https://console.cloud.google.com)

---

## Installation

**1. Install dependencies**

In the project root directory, run:

```bash
npm install
```

**2. Set up environment variables**

Create a file named `.env` in the project root directory with the following contents:

```
VITE_OPENWEATHER_API_KEY=your_openweathermap_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

Replace `your_openweathermap_key_here` and `your_google_maps_key_here` with your actual API keys.

`.env.example` has been setup for easier setup.

---

## Running the App

Start the development server:

```bash
npm run dev
```

Then open your browser and go to the local URL shown in the terminal (typically `http://localhost:5173`).

The app will ask for your location on load. If you deny permission or location is unavailable, it falls back to Mile End, London.

---

## Features

| Feature                     | Description                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Weather Dashboard** | Full-screen weather view with condition-matched backgrounds, air quality, UV index, humidity, visibility, wind compass, and live forecast rain likelihood |
| **Map-Aware Weather** | Weather data updates dynamically when panning the map, using ~1km coordinate bucketing for instant cache hits                                             |
| **Hourly Strip**      | 5-slot weather bar showing past to future conditions using Open-Meteo history and OWM forecast                                                            |
| **Pitch Finder**      | Google Maps with sport-icon markers (football / cricket). Search expands into a filterable list sorted by distance                                        |
| **Search This Area**  | Zoom-aware search button - radius scales with map zoom level                                                                                              |
| **Pitch Details**     | Bottom-sheet with opening hours, photos, walking distance, website, and Google Maps directions                                                            |
| **Photo Gallery**     | Full-screen lightbox with pre-cached images and navigation                                                                                                |
| **Pitch Conditions**  | Per-pitch wetness and muddiness algorithm (see below)                                                                                                     |
| **Locate Me**         | One-tap snap-to-location button                                                                                                                           |

---

## Pitch Condition Algorithm

When you tap a pitch, the app fetches **48 hours of hourly weather history specific to that pitch's coordinates** from the free [Open-Meteo API](https://open-meteo.com/), then runs a weighted calculation to produce two 0-100% scores:

### Wetness (how likely the surface is wet)

| Factor               | Weight | How it's calculated                                                       |
| -------------------- | ------ | ------------------------------------------------------------------------- |
| Currently raining    | 40%    | `1.0` if the OWM condition is rain/drizzle/thunderstorm, else `0`     |
| Recent rainfall      | 35%    | Total precipitation (mm) over 48h, capped at 15mm, linear 0-1             |
| Humidity             | 15%    | Current humidity mapped from 50-100% to linear 0-1                        |
| Time since last rain | 10%    | Hours since the most recent rainy hour, inverted over a 12h drying window |

### Muddiness (how likely the ground is soft/muddy)

| Factor               | Weight | How it's calculated                                              |
| -------------------- | ------ | ---------------------------------------------------------------- |
| 48h rainfall total   | 45%    | Total precipitation capped at 20mm, linear 0-1                   |
| Sustained rain hours | 25%    | Count of rainy hours divided by total hours in the window        |
| Temperature effect   | 15%    | Colder temps slow evaporation: mapped from 15C to 0C, linear 0-1 |
| Humidity             | 15%    | Same as wetness humidity factor                                  |

### Human-readable labels

| Percentage | Wetness Label  | Muddiness Label  |
| ---------- | -------------- | ---------------- |
| 0-14%      | Bone Dry       | Firm Ground      |
| 15-29%     | Probably Fine  | Probably Fine    |
| 30-49%     | Possibly Damp  | Possibly Muddy   |
| 50-69%     | Likely Wet     | Likely Muddy     |
| 70-100%    | Definitely Wet | Definitely Muddy |

Results are cached by place ID so re-opening a pitch you have already viewed is instant with no re-fetch.

---

## Environment Variables

| Variable                     | Required | Description                                                     |
| ---------------------------- | -------- | --------------------------------------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | Yes      | OpenWeatherMap API key                                          |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes      | Google Maps JavaScript API key (Places library must be enabled) |
