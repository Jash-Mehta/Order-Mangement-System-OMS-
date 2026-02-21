import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UsersRepositories } from '../repositories/users.repositories';

export class AuthService {
  constructor(private userRepo: UsersRepositories) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(userId: string, email: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    return jwt.sign(
      { userId, email },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    return jwt.verify(token, jwtSecret);
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    // Check if user already exists
    const existingUser = await this.userRepo.loginUser(userData.email);
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists with this email'
      };
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const user = await this.userRepo.createUser({
      name: userData.name,
      email: userData.email,
      password_hash: hashedPassword
    });

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  async login(credentials: {
    email: string;
    password: string;
  }) {
    // Find user
    const user = await this.userRepo.loginUser(credentials.email);
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValidPassword = await this.comparePassword(
      credentials.password,
      user.password_hash
    );

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      },
      
    };
  }

  async getAllUsers() {
    try {
      const users = await this.userRepo.getAllUsers();
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
