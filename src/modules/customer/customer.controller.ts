import { Request, Response, NextFunction } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { customerService } from "./customer.service";


export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === "string" ? search : undefined;

        const { page, limit, skip } = paginationSortingHelper(req.query);

        const result = await customerService.getAllCustomers({
            search: searchString || '',
            page,
            limit,
            skip
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// POST /customers → create if not exists
export const createCustomerIfNotExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone } = req.body;

        if (!name) return res.status(400).json({ error: "Customer name is required" });

        const customer = await customerService.findOrCreateCustomer({ name, email, phone });

        res.status(200).json({ data: customer });
    } catch (error) {
        next(error);
    }
};