
# Pastebin-Lite

A small Pastebin-like application that allows users to create text pastes and share a link to view them.  
Pastes can optionally expire based on time-to-live (TTL) and/or a maximum number of views.

This project is built with Node.js and MongoDB and deployed on Vercel.

---

## Deployed Application

- **Live URL:** https://your-app.vercel.app  
- **GitHub Repository:** https://github.com/EpsiGayu/pastebin-lite

---

## Features

- Create a paste containing arbitrary text
- Generate a shareable URL for each paste
- View pastes via API or HTML page
- Optional expiration using:
  - Time-based expiry (TTL)
  - View-count limit
- Safe rendering of paste content (no script execution)
- Deterministic time support for automated testing

---

## Tech Stack

- **Backend:** Node.js (Vercel serverless functions)
- **Database:** MongoDB
- **Frontend:** Simple HTML
- **Deployment:** Vercel
- **API Testing:** Postman

---

## Persistence Layer

MongoDB is used to persist paste data across requests.  
Each paste stores its content, creation time, optional expiration time, maximum allowed views, and current view count.  
MongoDB was chosen to ensure reliable persistence in a serverless environment and to support atomic updates for view counting.

---

## API Endpoints

### Health Check
**GET** `/api/healthz`

Response:
```json
{ "ok": true }

Design Decisions

MongoDB is used for persistence to support serverless deployment

View counts are updated atomically to avoid race conditions

Paste content is escaped before rendering to prevent XSS

All unavailable pastes return HTTP 404 consistently

API responses always return valid JSON
