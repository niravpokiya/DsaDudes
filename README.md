# DsaChamp - DSA Coding Platform

DsaChamp is a full-stack DSA practice platform where users can browse coding problems, write code in an online editor, run sample tests, submit solutions, track submissions, and view profile stats. It also includes admin tooling for creating problems and managing hidden testcases.

The project is built with a React frontend and Spring Boot microservices. Code execution is handled asynchronously using Kafka, Redis, and isolated Docker containers.

## Features

- User registration, login, JWT authentication, and logout
- Problem list and problem detail pages
- Monaco-based code editor
- Run code on custom/sample input
- Submit code against hidden testcases
- Submission history and verdict details
- Profile and solved-problem stats
- Admin dashboard for problem creation, editing, and testcase upload
- Isolated code execution using Docker containers

## Code Execution Architecture

![Code Execution Architecture](./code-execution-architecture.png)

High-level execution flow:

1. Client sends a run/submit request through the API Gateway.
2. API Gateway routes the request to the Execution Submission Service.
3. Execution Submission Service creates a job, stores live status in Redis, and publishes the job to Kafka.
4. Execution Worker Service consumes the Kafka job.
5. Worker fetches problem metadata/testcase details when needed.
6. Worker executes code inside isolated Docker containers.
7. Worker stores live result in Redis and updates final submission data.
8. Client polls through the API Gateway and Submission Service to display the result.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Axios, Monaco Editor |
| Backend | Spring Boot, Spring Cloud Gateway, OpenFeign |
| Service Discovery | Eureka |
| Auth | JWT, role-based access |
| Queue | Kafka |
| Cache | Redis |
| Databases | PostgreSQL, MongoDB |
| Code Execution | Docker container pool |

## Services And Ports

| Service | Port | Purpose |
| --- | ---: | --- |
| Frontend | 5173 | React/Vite web app |
| API Gateway | 8080 | Request routing, JWT validation, role checks |
| Service Registry | 8761 | Eureka discovery server |
| User Service | 8084 | Auth, users, profile, stats |
| Question Service | 8081 | Problems, admin problem management, testcases |
| Execution Submission Service | 8092 | Run/submit API, submissions, solved data, Kafka producer |
| Execution Worker Service | 8098 | Kafka consumer and Docker-based code execution |
| Redis | 6379 | Token blacklist and live execution result cache |
| Kafka | 9092 | Async execution job queue |
| PostgreSQL | 5432 | User database |

## Prerequisites

Install these before running the project:

- Java 21
- Maven or the included Maven wrappers
- Node.js and npm
- Docker Desktop
- PostgreSQL
- MongoDB database, local or Atlas

## Local Setup

### 1. Clone The Repository

```bash
git clone https://github.com/niravpokiya/DsaChamp.git
cd DSA-Platform
```

### 2. Configure Environment Values

Create/update the required local configuration values.

Frontend:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Backend services need these values available through `application.properties` or environment variables:

```env
JWT_SECRET_KEY=<your-jwt-secret>
EUREKA_SERVER_URL=http://localhost:8761/eureka
```

Configure database connections:

- User Service: PostgreSQL database URL, username, and password
- Question Service: MongoDB URI and database name
- Execution Submission Service: MongoDB URI, Redis host/port, Kafka bootstrap server
- Execution Worker Service: Redis host/port, Kafka bootstrap server, testcase storage path

Do not commit real secrets or database passwords.

### 3. Start Redis And Kafka

From the local config directory:

```bash
cd DsaChamp-local-config
docker compose up -d
```

This starts:

- Redis on `localhost:6379`
- Kafka on `localhost:9092`

### 4. Start PostgreSQL

Create the user database used by User Service:

```sql
CREATE DATABASE dsachamp_userdb;
```

Update the User Service datasource config to match your local PostgreSQL username and password.

### 5. Configure MongoDB

Create or connect to a MongoDB database for:

- Questions
- Submissions
- Solved problem data

Update the MongoDB URI in Question Service and Execution Submission Service configuration.

### 6. Build The Code Runner Image

The execution worker expects a Docker image named `cpp-runner`.

```bash
cd DsaChamp-local-config/cpp-runner
docker build -t cpp-runner .
```

### 7. Start Backend Services

Start services in this order:

1. Service Registry
2. API Gateway
3. User Service
4. Question Service
5. Execution Submission Service
6. Execution Worker Service

Using the Maven wrapper from each service folder:

```bash
cd backend/service-registry
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```powershell
.\mvnw.cmd spring-boot:run
```

Repeat the same command inside each backend service directory.

### 8. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Backend Service Summary

### API Gateway

- Entry point for frontend requests
- Validates JWT token
- Checks blacklisted tokens in Redis
- Applies role-based access
- Routes requests to registered services through Eureka

### User Service

- Handles registration, login, logout, profile, and stats
- Stores user data in PostgreSQL
- Uses Redis for token blacklist

### Question Service

- Manages coding problems
- Handles admin problem create/update flows
- Handles hidden testcase upload/download/status
- Stores question data in MongoDB

### Execution Submission Service

- Accepts run and submit requests
- Creates execution jobs
- Stores active job status in Redis
- Publishes jobs to Kafka
- Stores final submission and solved data in MongoDB

### Execution Worker Service

- Consumes execution jobs from Kafka
- Executes user code in Docker containers
- Supports C++, Java, Python, and JavaScript
- Applies timeout/resource limits through the containerized execution flow
- Updates Redis and final submission results

## Useful Commands

Build frontend:

```bash
cd frontend
npm run build
```

Run backend tests for a service:

```bash
cd backend/<service-folder>
./mvnw test
```

Stop Redis and Kafka:

```bash
cd DsaChamp-local-config
docker compose down
```

## Project Structure

```text
DSA-Platform/
  frontend/                         React/Vite frontend
  backend/
    api-gateway/                    Spring Cloud Gateway
    service-registry/               Eureka server
    User-service/                   Auth and users
    Question-service/               Problems and testcases
    Execution-Submission-Service/   Submissions and Kafka producer
    Execution-worker-Service/       Kafka consumer and Docker execution
  DsaChamp-local-config/
    docker-compose.yml              Redis and Kafka
    cpp-runner/                     Code runner Docker image
  code-execution-architecture.png
```

