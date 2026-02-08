# Order Management System (OMS)

A robust, scalable backend API for managing orders, users, and payments with modern architecture and best practices.

## 🚀 Features

- **Order Management**: Create, retrieve, and manage orders with full lifecycle tracking
- **User Authentication**: Secure user registration and authentication system
- **Payment Integration**: Razorpay payment gateway integration with webhook support
- **Inventory Management**: Real-time inventory tracking and reservation system
- **Type-Safe**: Full TypeScript implementation with strict typing
- **Database**: PostgreSQL with Kysely query builder for type-safe database operations
- **Architecture**: Clean architecture with dependency injection and separation of concerns

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Installation

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jash-Mehta/order-management-system.git
   cd order-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run migrate:dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/oms_database

# Server
PORT=3000
NODE_ENV=development

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# JWT (for authentication)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## 🗄 Database Setup

The application uses PostgreSQL as the primary database. The database schema is managed through SQL migrations located in `src/database/migrations/`.

### Running Migrations

```bash
# Development
npm run migrate:dev

# Production (after building)
npm run migrate
```

### Database Schema

The system includes the following main tables:

- **users**: User accounts and authentication data
- **orders**: Order information and status tracking
- **payments**: Payment records and transaction details
- **inventory**: Product inventory management
- **reservations**: Inventory reservation system

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Protected endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Users
- `POST /users/create` - Create a new user
- `POST /users/login` - User authentication

#### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID

#### Payments
- `POST /payments` - Create a payment
- `POST /payments/webhook` - Razorpay webhook endpoint

#### Health
- `GET /health` - Health check endpoint

### Example API Calls

**Create User**
```bash
curl -X POST http://localhost:3000/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Create Order**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "customer_id": "user-uuid",
    "total_amount": 99.99,
    "items": [
      {
        "product_id": "product-uuid",
        "quantity": 2,
        "price": 49.99
      }
    ]
  }'
```

## 🏗 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
├── database/              # Database setup and migrations
│   ├── migrations/        # SQL migration files
│   └── index.ts          # Database connection
├── DI/                   # Dependency injection container
├── modules/              # Feature modules
│   ├── users/           # User management
│   ├── orders/          # Order management
│   ├── payments/        # Payment processing
│   ├── inventory/       # Inventory management
│   └── health/          # Health checks
└── scripts/             # Utility scripts
```

### Module Structure

Each module follows a consistent structure:

```
module-name/
├── controllers/          # Request handlers
├── services/           # Business logic
├── repositories/       # Data access layer
├── routes/            # Route definitions
├── types/             # TypeScript type definitions
└── schema.ts          # Database schema definitions
```

## 🛠 Technologies

### Core Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Kysely** - Type-safe query builder

### Development Tools
- **ts-node** - TypeScript execution
- **ts-node-dev** - Development server with auto-reload
- **ESLint** - Code linting
- **Prettier** - Code formatting

### External Services
- **Razorpay** - Payment gateway
- **JWT** - Authentication tokens

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Type checking without compilation

# Database
npm run migrate:dev  # Run database migrations (development)
npm run clear:data   # Clear all database data
```

### Code Quality

The project follows strict TypeScript configuration and uses modern JavaScript features:

- Strict type checking
- No implicit any types
- Proper error handling
- Clean architecture principles
- Dependency injection

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔄 CI/CD

The project is configured for continuous integration and deployment:

- **GitHub Actions** for automated testing
- **Docker** support for containerization
- **Environment-specific configurations**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 API Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## 🔒 Security

- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention with Kysely
- Environment variable protection
- CORS configuration
- Rate limiting (recommended for production)

## 📈 Performance

- Database connection pooling
- Efficient query building with Kysely
- Async/await for non-blocking operations
- Memory-efficient data structures
- Response caching (where applicable)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **Migration Failures**
   - Check database permissions
   - Ensure migrations are sequential
   - Review SQL syntax

3. **TypeScript Errors**
   - Run `npm run typecheck`
   - Check imports and exports
   - Verify type definitions

### Getting Help

- Check the [Issues](https://github.com/your-username/order-management-system/issues) page
- Review the [Wiki](https://github.com/your-username/order-management-system/wiki) for detailed guides
- Join our [Discord](https://discord.gg/your-server) for community support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) for the web framework
- [Kysely](https://kysely.dev/) for the type-safe query builder
- [PostgreSQL](https://www.postgresql.org/) for the reliable database
- [Razorpay](https://razorpay.com/) for payment processing
- The open-source community for inspiration and tools

---

**Built with ❤️ by [Jash Mehta]**
