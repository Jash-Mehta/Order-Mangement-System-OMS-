# Error Response Format Examples

This document shows the standardized error response format now implemented across all controllers.

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "uuid-here",
    "customer_id": "customer-uuid",
    "status": "CREATED",
    "total_amount": 99.99
  }
}
```

### Error Response
```json
{
  "statusCode": 404,
  "success": false,
  "message": "No data found",
  "error": {
    "code": "NOT_FOUND",
    "details": "No records matched the given criteria"
  }
}
```

## API Endpoint Examples

### 1. Order Not Found
**Request:** `GET /orders/invalid-uuid`

**Response:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Order not found",
  "error": {
    "code": "NOT_FOUND",
    "details": "No order found with ID: invalid-uuid"
  }
}
```

### 2. Bad Request - Missing customerId
**Request:** `GET /orders` (without customerId query param)

**Response:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "customerId query parameter is required and must be a single value",
  "error": {
    "code": "BAD_REQUEST",
    "details": "customerId query parameter is required and must be a single value"
  }
}
```

### 3. Product Not Found
**Request:** `GET /inventory/invalid-product-id`

**Response:**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not found",
  "error": {
    "code": "NOT_FOUND",
    "details": "No product found with ID: invalid-product-id"
  }
}
```

### 4. Unauthorized - Invalid Login
**Request:** `POST /users/login` with invalid credentials

**Response:**
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Login failed",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Invalid credentials"
  }
}
```

### 5. Webhook Signature Missing
**Request:** `POST /payments/webhook` without signature header

**Response:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Missing webhook signature",
  "error": {
    "code": "BAD_REQUEST",
    "details": "x-razorpay-signature header is required"
  }
}
```

### 6. Internal Server Error
**Request:** Any request that causes server error

**Response:**
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Failed to create order",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": "Database connection failed"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|-------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `INTERNAL_ERROR` | 500 | Server internal error |

## Controllers Updated

- ✅ OrderController
- ✅ PaymentsControllers  
- ✅ InventoryControllers
- ✅ UserControllers

All controllers now use the standardized `ResponseUtil` class for consistent error handling.
