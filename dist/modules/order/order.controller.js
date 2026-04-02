"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const order_service_1 = require("./order.service");
const paginationSortingHelper_1 = __importDefault(require("../../helpers/paginationSortingHelper"));
// GET /orders → list orders
const getOrders = async (req, res, next) => {
    try {
        const { search, status, startDate, endDate } = req.query;
        const { page, limit, skip, sortBy, sortOrder: rawSortOrder } = (0, paginationSortingHelper_1.default)(req.query);
        const sortOrder = rawSortOrder === "desc" ? "desc" : "asc";
        const result = await order_service_1.orderService.getAllOrders({
            search: typeof search === "string" ? search : undefined,
            status: typeof status === "string" ? status : undefined,
            startDate: typeof startDate === "string" ? new Date(startDate) : undefined,
            endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
            page,
            limit,
            skip,
            sortBy,
            sortOrder,
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
// POST /orders → create a new order
const createOrder = async (req, // plain Request
res, next) => {
    try {
        const { customer, items } = req.body;
        if (!customer || !customer.name) {
            return res.status(400).json({ error: "Customer name is required" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Add at least one product to the order" });
        }
        // Cast user locally
        const user = req.user;
        if (!user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const result = await order_service_1.orderService.createOrder({
            customer,
            items,
            userId: user.id,
        });
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json({ data: result.order });
    }
    catch (error) {
        next(error);
    }
};
const updateOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status, items, customer } = req.body;
        const user = req.user;
        if (!user?.id)
            return res.status(401).json({ error: "Unauthorized" });
        const result = await order_service_1.orderService.updateOrder(orderId, { status, items, customer });
        if (result.error)
            return res.status(400).json({ error: result.error });
        res.status(200).json({ data: result.order });
    }
    catch (error) {
        next(error);
    }
};
exports.orderController = {
    getOrders,
    createOrder,
    updateOrder
};
//# sourceMappingURL=order.controller.js.map