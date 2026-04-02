"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)();
// GET /customers → filter/search
router.get("/", customer_controller_1.getCustomers);
// POST /customers → create if not exists (optional)
router.post("/", customer_controller_1.createCustomerIfNotExist);
exports.customerRouter = router;
//# sourceMappingURL=customer.route.js.map