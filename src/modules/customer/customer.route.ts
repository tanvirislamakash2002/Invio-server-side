import { Router } from "express";
import { createCustomerIfNotExist, getCustomers } from "./customer.controller";

const router = Router();

// GET /customers → filter/search
router.get("/", getCustomers);

// POST /customers → create if not exists (optional)
router.post("/", createCustomerIfNotExist);

export const customerRouter: Router = router;