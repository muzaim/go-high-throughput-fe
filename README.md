# Flash Sale Inventory Reservation Dashboard (Frontend)

Frontend web application for the high-concurrency flash sale inventory reservation assessment (Surya Store). Built with React, Vite, TypeScript, Tailwind CSS, and React Router.

---

## Tech Stack

- **Framework**: React 18 (Vite)
- **Routing**: React Router v6 (`/` catalog, `/items/:itemId` item detail)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Primary Accent: `#E81E28`)
- **Typography**: Inter (UI text) & IBM Plex Mono (technical metrics & numbers)
- **HTTP Client**: Native `fetch` API wrapper with custom error code mapping

---

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Docker**: (Optional) for containerized deployment
- **Backend API**: Go Gin Backend running at `http://localhost:8080`

---

## Getting Started

### 1. Clone & Configure Environment

```bash
git clone https://github.com/muzaim/go-high-throughput-fe.git
cd go-high-throughput-fe
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend server:

```env
VITE_API_URL=http://localhost:8080
```

### 2. Local Development

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

### 3. Production Build & Preview

```bash
npm run build
npm run preview
```

---

## Running with Docker

### Using Docker Compose

```bash
docker-compose up -d --build
```

The application will be served via Nginx on `http://localhost:3000`.

To stop the container:

```bash
docker-compose down
```

### Using Docker CLI directly

```bash
docker build -t surya-store-fe .
docker run -d -p 3000:3000 --name surya-store-fe surya-store-fe
```

---

## Concurrency Benchmark Testing (`benchmark.js`)

A built-in benchmark script is provided to simulate high-concurrency flash sale traffic (1,000 parallel POST requests) against the backend.

### How to Run:

1. Ensure the Go Gin backend is running at `http://localhost:8080`.
2. Run the benchmark script:

```bash
node benchmark.js
```

### Benchmark Summary Output:

The script fires 1,000 concurrent reservation requests and reports throughput, successful reservations, insufficient inventory conflicts, and errors:

```text
==========================================
📊 BENCHMARK RESULT SUMMARY
==========================================
⏱ Total Time Elapsed : 0.85 seconds
⚡ Throughput         : 1176 requests/sec
------------------------------------------
✅ Reserved Success   : 85
⚠️ Insufficient Stock: 915
❌ Failed / Errors    : 0
==========================================
```

---

## Routes & Application Features

- `/` — Product Catalog Page: E-commerce card grid displaying all items with Unsplash product imagery and "View" button.
- `/items/:itemId` — Product Detail Page:
  - High-res product photo.
  - Live Inventory Tracker displaying Total, Reserved, and Available stock with manual refresh button and timestamp.
  - Reservation Form supporting quantity input validation.
  - Active Reservation Card featuring 5-minute countdown timer based on backend `expires_at` timestamp.
  - Purchase Confirmation flow.
  - Standalone "Item Not Found" card for invalid item IDs (404).

---

## Backend API Integration

- `GET /api/v1/inventory/items` — Retrieves all catalog items.
- `GET /api/v1/inventory/stock?item_id={id}` — Retrieves current stock numbers for a given item.
- `POST /api/v1/inventory/reserve` — Submits a stock reservation (`user_id`, `item_id`, `quantity`).
- `POST /api/v1/inventory/confirm` — Confirms an active reservation (`reservation_id`).
