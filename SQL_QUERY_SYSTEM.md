# SQL Query Management System

This system separates SQL queries from repository logic for better organization and maintainability.

## 📁 File Structure

```
src/modules/
├── order/
│   └── repositories/
│       ├── order.repository.ts    # Repository logic
│       └── queries.sql          # SQL queries
├── inventory/
│   └── repositories/
│       ├── inventory.repositories.ts
│       └── queries.sql
├── payment/
│   └── repositories/
│       ├── payments.repositories.ts
│       └── queries.sql
└── users/
    └── repositories/
        ├── users.repositories.ts
        └── queries.sql
```

## 🔧 How It Works

### 1. SQL Query Files (.sql)
- Store all SQL queries with descriptive comments
- Use parameterized queries with `$1`, `$2`, etc.
- Organize by functionality with clear comments

**Example:**
```sql
-- Get user by email
SELECT 
  id,
  name,
  email,
  password_hash,
  created_at,
  updated_at
FROM users
WHERE email = $1;
```

### 2. QueryLoader Utility
- Loads SQL queries from files
- Caches queries for performance
- Provides easy access to named queries

### 3. Repository Usage
```typescript
import { QueryLoader } from '../../../utils/query-loader.util';

export class UserRepository {
  async getUserByEmail(email: string): Promise<any> {
    const query = QueryLoader.getQuery(
      'src/modules/users/repositories/queries.sql',
      'Get user by email'
    );
    
    const { rows } = await pgPool.query(query, [email]);
    return rows[0];
  }
}
```

## 🎯 Benefits

### **Separation of Concerns**
- SQL logic separated from TypeScript logic
- Database queries in one place
- Easy to find and modify queries

### **Maintainability**
- SQL syntax highlighting in .sql files
- Easy to test queries separately
- Version control for query changes

### **Performance**
- Queries cached in memory
- No repeated file reads
- Fast query retrieval

### **Security**
- Parameterized queries prevent SQL injection
- Consistent parameter usage
- Easy to audit queries

## 📝 Adding New Queries

### 1. Add to SQL File
```sql
-- Your new query description
SELECT 
  column1,
  column2
FROM table_name
WHERE condition = $1
ORDER BY created_at DESC;
```

### 2. Use in Repository
```typescript
async getYourMethod(param: string): Promise<any[]> {
  const query = QueryLoader.getQuery(
    'src/modules/your-module/repositories/queries.sql',
    'Your new query description'
  );
  
  const { rows } = await pgPool.query(query, [param]);
  return rows;
}
```

## 🔄 Query Loading Process

1. **First Call**: Read file, parse queries, cache in memory
2. **Subsequent Calls**: Return cached queries instantly
3. **Development**: Use `reloadQueries()` to refresh cache

## 📋 Best Practices

### **Query Naming**
- Use descriptive, unique names
- Follow consistent pattern
- Include purpose in comment

### **Parameter Usage**
- Always use parameterized queries (`$1`, `$2`)
- Never concatenate strings for values
- Match parameter order to method arguments

### **Error Handling**
- QueryLoader returns empty string for missing queries
- Repository methods handle query errors
- Log query loading issues

### **Performance**
- Keep queries focused and efficient
- Use appropriate indexes
- Consider query complexity

## 🚀 Example Implementation

### Complete Repository Method
```typescript
export class UserRepository {
  async getUsersWithOrders(userId: string): Promise<any[]> {
    const query = QueryLoader.getQuery(
      'src/modules/users/repositories/queries.sql',
      'Get user with orders'
    );
    
    try {
      const { rows } = await pgPool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch user orders');
    }
  }
}
```

This system provides a clean, maintainable way to manage SQL queries while keeping your repository code focused on business logic.
