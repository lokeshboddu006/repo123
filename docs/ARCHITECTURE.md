# Architecture Overview

## System Architecture

```
+-------------------------------------------------------------------+
|                        React + Vite Frontend                      |
|                  (Port 5173 / Admin Dashboard)                    |
+-------------------------------------------------------------------+
                                  |
                                  | HTTP / REST (JWT)
                                  v
+-------------------------------------------------------------------+
|                         Django Backend                            |
|                     (Port 8000 / REST API)                        |
+-------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
|  PostgreSQL Database  |                   |   FastAPI AI Service  |
|      (Port 5432)      |                   |      (Port 8001)      |
+-----------------------+                   +-----------------------+
```

## Modular Components

1. **Frontend (`frontend/`)**: React.js, Vite, Tailwind CSS, React Router, Axios, Recharts.
2. **Backend (`backend/`)**: Django REST Framework, SimpleJWT authentication, PostgreSQL ORM.
3. **AI Service (`ai-service/`)**: FastAPI, Uvicorn (Microservice for AI generation, translation, sentiment, quality check).
4. **Database (`PostgreSQL`)**: Central relational database monitored via DBeaver.
