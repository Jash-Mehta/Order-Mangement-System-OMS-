
import { UserServices } from "../services/users.services";
import type { Request, Response } from 'express';

export class UserControllers{
    constructor(private userService: UserServices ){}

    createUser = async (req: Request,res: Response): Promise<void> => {
        const payLoad = req.body;
        const user = await this.userService.createUser(payLoad);
        res.status(201).json(user);
    }

    loginUser = async (req: Request, res: Response) : Promise<void> => {
        const payLoad = req.body;
        const loginUser = await this.userService.loginUser(payLoad);
        if(loginUser.Success==false){
            res.status(401).json(loginUser);
        }
        res.status(201).json(loginUser);
    }
}