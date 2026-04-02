"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerIfNotExist = exports.getCustomers = void 0;
const paginationSortingHelper_1 = __importDefault(require("../../helpers/paginationSortingHelper"));
const customer_service_1 = require("./customer.service");
const getCustomers = async (req, res, next) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === "string" ? search : undefined;
        const { page, limit, skip } = (0, paginationSortingHelper_1.default)(req.query);
        const result = await customer_service_1.customerService.getAllCustomers({
            search: searchString || '',
            page,
            limit,
            skip
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
// POST /customers → create if not exists
const createCustomerIfNotExist = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        if (!name)
            return res.status(400).json({ error: "Customer name is required" });
        const customer = await customer_service_1.customerService.findOrCreateCustomer({ name, email, phone });
        res.status(200).json({ data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomerIfNotExist = createCustomerIfNotExist;
//# sourceMappingURL=customer.controller.js.map