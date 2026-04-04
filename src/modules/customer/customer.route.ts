// src/modules/customer/customer.route.ts
import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { createCustomerIfNotExist, getCustomers } from "./customer.controller";

const router = Router();

// Protect routes - only authenticated users can access customers
router.get("/", auth(Role.ADMIN, Role.MANAGER, Role.STAFF), getCustomers);
router.post("/", auth(Role.ADMIN, Role.MANAGER, Role.STAFF), createCustomerIfNotExist);

export const customerRouter: Router = router;