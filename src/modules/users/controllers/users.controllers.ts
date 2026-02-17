
import { UserServices } from "../services/users.services";
import type { Request, Response } from 'express';
import { ResponseUtil } from "../../../utils/response.util";

export class UserControllers{
    constructor(private userService: UserServices ){}

    createUser = async (req: Request,res: Response): Promise<void> => {
        try {
            const payLoad = req.body;
            const user = await this.userService.createUser(payLoad);
            ResponseUtil.created(res, user, 'User created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create user', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    loginUser = async (req: Request, res: Response) : Promise<void> => {
        try {
            const payLoad = req.body;
            const loginUser = await this.userService.loginUser(payLoad);
            if(loginUser.Success==false){
                ResponseUtil.unauthorized(res, loginUser.message || 'Login failed', 'Invalid credentials');
                return;
            }
            ResponseUtil.success(res, loginUser, 'Login successful');
        } catch (error) {
            ResponseUtil.internalError(res, 'Login failed', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}