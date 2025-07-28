# KFATS Client

This is the frontend client for the KFATS application, built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

The client provides the user interface for the KFATS full-stack application, communicating with the FastAPI backend server.

## Getting Started

### From Root Directory (Recommended)

Run both client and server concurrently from the project root:

```bash
# Install all dependencies
npm run install:all

# Start both client and server
npm run dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://127.0.0.1:8000

### Client Only

To run only the frontend client:

```bash
# From project root
npm run client:dev

# Or from client directory
cd client
npm run dev
```

## Development

- Open [http://localhost:3000](http://localhost:3000) to view the application
- Edit `app/page.tsx` to modify the main page - changes auto-update
- The client communicates with the FastAPI server at `http://127.0.0.1:8000`

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Turbopack** for faster development builds
- **Tailwind CSS** for styling (if configured)
- **Hot reload** during development
- **Optimized fonts** using [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) with [Geist](https://vercel.com/font)

## Project Structure

```
client/
├── src/
│   └── app/
│       ├── page.tsx          # Main page component
│       ├── layout.tsx        # Root layout
│       └── globals.css       # Global styles
├── public/                   # Static assets
├── package.json             # Client dependencies
└── README.md               # This file
```

## API Integration

The client is configured to communicate with the FastAPI backend. API endpoints are available at:
- **Base URL**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deployment

### Vercel (Recommended)

The easiest way to deploy the Next.js client is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Other Platforms

You can also deploy to:
- Netlify
- Railway
- Docker containers
- Traditional hosting providers

Make sure to configure environment variables for API endpoints in production.
