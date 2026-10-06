# Flash Sale Inventory Dashboard (Frontend)

Frontend mini-dashboard for the high-concurrency flash sale inventory reservation take-home test, built with React, Vite, TypeScript, and Tailwind CSS.

---

## Tech Stack

- **Framework**: React 18 (Vite)
- **Routing**: React Router v6
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Primary color: `#E81E28`)
- **HTTP Client**: Native Fetch API wrapper with custom error handling

---

## Prerequisites

Before running the application, make sure you have:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Backend API**: Go Gin Backend running at `http://localhost:8080`

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/muzaim/go-high-throughput-fe.git
cd go-high-throughput-fe
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend server in `.env`:

```env
VITE_API_URL=http://localhost:8080
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` (or the port shown in terminal).

---

## Production Build

To compile the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Application Structure & Routes

- `/` — Product Catalog Page (browse items)
- `/items/:itemId` — Item Detail Page (live inventory tracker, 5-minute reservation countdown, and purchase confirmation)

---

## Backend API Endpoints

The frontend connects to the following backend API endpoints:

- `GET /api/v1/inventory/items` — Fetches catalog items
- `GET /api/v1/inventory/stock?item_id={id}` — Fetches live stock details for a specific item
- `POST /api/v1/inventory/reserve` — Submits a stock reservation
- `POST /api/v1/inventory/confirm` — Confirms an active reservation
