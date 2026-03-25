# Logistic Backend

A production-ready Node.js Express MongoDB Backend with best practices, clean architecture, and scalability.

## Features

- **ES6+**: Use modern JavaScript syntax
- **Express**: Fast, unopinionated, minimalist web framework
- **Mongoose**: Elegant mongodb object modeling for node.js
- **Authentication**: JWT based authentication with Passport
- **Authorization**: Role-based access control
- **Validation**: Request validation using Joi
- **Logging**: Winston and Morgan for logging
- **Security**: Helmet, XSS-clean, MongoSanitize, CORS, and Rate Limiting
- **Documentation**: Swagger for API documentation
- **Linting**: ESLint and Prettier for code quality
- **Testing**: Jest and Supertest for integration testing
- **Error Handling**: Centralized error handling middleware

## Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

### Running Locally

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Documentation

Available at `http://localhost:3000/v1/docs` in development mode.

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## Folder Structure

```
src/
  config/         # Configuration files (env, logger, passport)
  controllers/    # HTTP controllers
  docs/           # Swagger documentation
  middlewares/    # Custom express middlewares
  models/         # Mongoose models
  routes/         # API routes
  services/       # Business logic
  utils/          # Reusable utility functions
  validations/    # Joi validation schemas
  app.js          # Express app setup
  server.js       # Server entry point
tests/            # Integration tests
```

## License

MIT
