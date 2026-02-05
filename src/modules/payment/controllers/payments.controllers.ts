import { Request, Response } from "express";
import { PaymentsServices } from "../services/payments.services";

export class PaymentsControllers {
    constructor(private paymentServices: PaymentsServices) { }
    createPayment = async (req: Request, res: Response) => {
        const data = await this.paymentServices.createPayment(req.body);
        return res.status(200).json(data);
    }

}