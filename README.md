# WHK Contract Insight Tool - Docker Setup Guide

This guide will help you set up and run the application using Docker.

## 1. Environment Files

- **Frontend:** Create your environment file at:
  - `frontend/apps/jlens/.env`
- **Backend:** Create your environment file at:
  - `backend/.env`

Add the required environment variables to each file as needed by your project.

## 2. Alembic Versions Folder

Create an empty folder for Alembic migration versions:

```
backend/alembic/versions
```

## 3. Database Migration Commands

Run the following commands to set up your database migrations:

```
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## 4. Start the Application with Docker

Use the following command to start all services:

```
docker-compose -f docker-compose.dev.yml up
```

This will build and run both the frontend and backend containers.

---

You are now ready to use the WHK Contract Insight Tool!
