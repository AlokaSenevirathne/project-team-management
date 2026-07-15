# System Architecture

The Project and Team Task Management Platform is built on a 3-tier client-server architecture.

```mermaid
graph TD
    subgraph Client Tier "Client Tier (Frontend)"
        A[Next.js Application] -->|HTTP/REST| B[Axios HTTP Service]
        B -->|Bearer Token Auth| C[JWT Interceptor]
    end

    subgraph Application Tier "Application Tier (Backend API)"
        D[Express Server] --> E[CORS & JSON Body Parser]
        E --> F[Auth Middleware]
        F --> G[Route Handlers / Controllers]
        G --> H[Prisma ORM Client]
    end

    subgraph Database Tier "Database Tier (Storage)"
        I[(MySQL Database)]
    end

    C -->|HTTP requests| D
    H -->|SQL Queries| I
```

## Architectural Highlights

1. **Decoupled Client-Server**: Frontend and backend are completely decoupled. They communicate exclusively over JSON-based RESTful API endpoints. This enables horizontal scalability of both the frontend client delivery and the API nodes.
2. **Stateless JWT Authentication**: Authentication is stateless. Upon validation of login credentials, the backend generates a signed JSON Web Token (JWT) containing user ID and role claims. The client stores this in local storage and sends it in the HTTP `Authorization` header for protected routes.
3. **ORM Database Abstraction**: Prisma ORM is utilized for clean database mapping, automated schema migrations, robust relationship modeling, and database transactions.
4. **Middleware-Based Authorization**: Protection is implemented modularly. Global authentication middleware validates the JWT, and route-specific authorization middleware enforces role permission scopes before invoking controller handlers.
