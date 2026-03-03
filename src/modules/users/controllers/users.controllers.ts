
import { AuthService } from "../services/auth.services";
import type { Request, Response } from 'express';
import { ResponseUtil } from "../../../utils/response.util";

export class UserControllers{
    constructor(private authService: AuthService) {}

    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                ResponseUtil.badRequest(res, 'Missing required fields', 'Name, email, and password are required');
                return;
            }

            const result = await this.authService.register({ name, email, password });
            
            if (!result.success) {
                ResponseUtil.badRequest(res, result.message || 'Registration failed');
                return;
            }

            ResponseUtil.created(res, result, 'User created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create user', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    loginUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                ResponseUtil.badRequest(res, 'Missing credentials', 'Email and password are required');
                return;
            }

            const result = await this.authService.login({ email, password });
            
            if (!result.success) {
                ResponseUtil.unauthorized(res, result.message || 'Login failed', 'Invalid credentials');
                return;
            }

            ResponseUtil.success(res, result, 'Login successful');
        } catch (error) {
            ResponseUtil.internalError(res, 'Login failed', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getAllUsers = async(req: Request, res: Response): Promise<void> => 
        {
            try {
                const result = await this.authService.getAllUsers();
                ResponseUtil.success(res, result.data, result.message);
            } catch (error) {
                ResponseUtil.internalError(res, 'Failed to get users', error instanceof Error ? error.message : 'Unknown error');
            }
        }
}