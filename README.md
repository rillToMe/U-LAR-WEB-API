# U-LAR Web API

U-LAR is an educational platform composed of an ASP.NET Core Web API backend and a React-based web frontend. The project supports authentication, student administration, exams, exam banks, and a planned cable-networking game workflow.

## Project Structure

```text
U-LAR-WEB-API/
├── u-lar_be/                 # ASP.NET Core Web API
│   ├── u-lar_be/
│   │   ├── Common/
│   │   ├── Configuration/
│   │   ├── Controllers/
│   │   ├── Domain/
│   │   ├── Features/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   └── Exams/
│   │   ├── Infrastructure/
│   │   ├── Migrations/
│   │   ├── Program.cs
│   │   └── appsettings.example.json
│   └── u-lar_be.slnx
├── u-lar_fe/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Technology Stack

### Backend

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL through Npgsql
- JWT Bearer authentication
- API versioning
- Scalar
- Scalar API reference
- CORS

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- ESLint

## Features

The backend is organized using a vertical-slice feature structure.

Current feature areas include:

- Authentication
- Administrator operations
- Student management
- Exams
- Exam banks
- JWT-protected API endpoints
- Student activation and deactivation
- Student password reset
- Scalar documentation during development

The frontend contains service modules for:

- Authentication
- Student administration
- Dashboard data
- Exams
- Exam banks
- API error handling

## Prerequisites

Install the following before starting development:

- .NET 10 SDK
- Node.js or Bun
- PostgreSQL
- Git

## Backend Setup

### 1. Navigate to the backend

```bash
cd u-lar_be/u-lar_be
```

### 2. Configure the application

Copy the example configuration file:

```bash
cp appsettings.example.json appsettings.Development.json
```

Update the configuration with your local PostgreSQL connection string, JWT settings, administrator seed settings, and CORS configuration.

Do not commit secrets or production credentials to the repository.

### 3. Restore dependencies

```bash
dotnet restore
```

### 4. Apply database migrations

```bash
dotnet ef database update
```

### 5. Run the API

```bash
dotnet run
```

The development API is configured to run locally. The included HTTP request file uses:

```text
http://localhost:5116
```

The exact port may vary depending on the local ASP.NET Core launch configuration.

## Frontend Setup

### 1. Navigate to the frontend

```bash
cd u-lar_fe
```

### 2. Install dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Configure the API URL

The frontend reads the API base URL from `VITE_API_BASE_URL`.

Create a `.env.local` file if the API is not running on the default host and port:

```env
VITE_API_BASE_URL=http://localhost:5116/api/v1
```

If this value is not provided, the frontend defaults to:

```text
http://<current-hostname>:5116/api/v1
```

### 4. Start the development server

Using Bun:

```bash
bun run dev
```

Using npm:

```bash
npm run dev
```

## Frontend Commands

From the `u-lar_fe` directory:

```bash
# Start the development server
bun run dev

# Build the application
bun run build

# Run ESLint
bun run lint

# Preview a production build
bun run preview
```

```bash
# Start the development server
npm run dev

# Build the application
npm run build

# Run ESLint
npm run lint

# Preview a production build
npm run preview
```

The equivalent commands can be run with `bun` when using Bun as the package manager.

## API

The API uses the `/api/v1` base path.

### Scalar

During development, the Scalar document is available at:

```text
GET /scalar/v1.json
```

Scalar API documentation is also enabled in the development environment.

### Authentication

Authentication uses JWT bearer tokens.

After obtaining an access token, include it in requests:

```http
Authorization: Bearer <access-token>
```

The frontend stores the token in `localStorage` under `accessToken` and automatically attaches it to API requests.

### Authentication Endpoint

```http
POST /api/v1/Auth/login
Content-Type: application/json
```

Example administrator request:

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

The frontend authentication service currently uses the `/Auth/admin/login` path. Keep the frontend and backend authentication routes aligned if the endpoint contract changes.

### Student Administration

The following administrator endpoints are available:

```http
GET /api/v1/Admin/students
GET /api/v1/Admin/students/{id}
POST /api/v1/Admin/students
PUT /api/v1/Admin/students/{id}
PATCH /api/v1/Admin/students/{id}/status
POST /api/v1/Admin/students/{id}/reset-password
```

Student list queries support filtering and pagination. Example:

```http
GET /api/v1/Admin/students?search=budi&isActive=true&page=1&pageSize=30
```

The documented paging behavior uses page numbers starting at `1`, with a default page size of `30` and a maximum page size of `100`.

Example student creation request:

```json
{
  "nim": "65748254",
  "name": "Mahasiswa Test",
  "email": "student@example.com",
  "password": "Student123!"
}
```

Example status update request:

```json
{
  "isActive": false
}
```

## Database

The backend uses Entity Framework Core with PostgreSQL.

Database initialization is performed when the application starts. The application also seeds an administrator account using the configured administrator seed options.

Before running the application, ensure that:

1. PostgreSQL is running.
2. The configured database exists or can be created by the configured connection.
3. The connection string is valid.
4. Entity Framework migrations have been applied.

## Architecture Notes

The backend follows a vertical-slice structure:

```text
Features/
├── Auth/
├── Admin/
└── Exams/
```

Each feature is intended to contain its own:

- Controllers
- DTOs
- Services
- Business logic
- Validation

Shared functionality belongs in `Common/` or `Domain/`.

The backend uses:

- Dependency injection
- Entity Framework Core and LINQ
- Centralized exception handling
- JWT authentication
- Versioned API routes

## Development Workflow

Start the backend first:

```bash
cd u-lar_be/u-lar_be
dotnet run
```

Then start the frontend in a separate terminal:

```bash
cd u-lar_fe
npm run dev
```

Scalar the frontend URL shown by Vite and verify that its `VITE_API_BASE_URL` points to the running backend.

## Testing API Requests

The backend includes an HTTP request file at:

```text
u-lar_be/u-lar_be/u-lar_be.http
```

It contains example requests for:

- Scalar retrieval
- Administrator login
- Student login
- Listing students
- Searching and filtering students
- Creating students
- Updating student status
- Testing protected administrator endpoints

Replace example credentials and bearer tokens with valid local development values.

## Game Flow Reference

The repository also contains a proposed game flow in `u-lar_be/struktur-game.txt`.

The described flow is:

```text
Boot
  ↓
Onboarding
  ↓
Login
  ↓
Main Menu
  ↓
Cable Selection
  ├── Straight
  └── Cross-over
        ↓
Gameplay
        ↓
Result
        ↓
Main Menu
```

Gameplay is organized around cable, tool, puzzle, and tester modules.

## Security Notes

- Never commit real passwords, JWT secrets, database credentials, or bearer tokens.
- Use local configuration files for development secrets.
- Use environment-specific configuration for staging and production.
- Replace sample credentials before deploying the application.
- Use HTTPS outside local development.
- Review CORS settings before exposing the API publicly.

## License

No license file is currently included in the repository. Add a license if this project is intended for public reuse or external contributions.
