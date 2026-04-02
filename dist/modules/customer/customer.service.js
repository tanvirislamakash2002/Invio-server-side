"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllCustomers = async ({ search, page, limit, skip }) => {
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } }
            ]
        });
    }
    const data = await prisma_1.prisma.customer.findMany({
        where: {
            AND: andConditions
        },
        take: limit,
        skip,
        orderBy: { name: "asc" }
    });
    const total = await prisma_1.prisma.customer.count({
        where: { AND: andConditions }
    });
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit)
        }
    };
};
// Find or create customer
const findOrCreateCustomer = async ({ name, email, phone }) => {
    // Try to find existing customer by name + (email or phone)
    let customer = await prisma_1.prisma.customer.findFirst({
        where: {
            AND: [
                { name: { equals: name, mode: "insensitive" } },
                {
                    OR: [
                        email ? { email: { equals: email, mode: "insensitive" } } : {},
                        phone ? { phone: { equals: phone } } : {}
                    ]
                }
            ]
        }
    });
    // If not found, create new
    if (!customer) {
        customer = await prisma_1.prisma.customer.create({
            data: {
                name,
                email: email ?? null,
                phone: phone ?? null
            }
        });
    }
    return customer;
};
exports.customerService = {
    getAllCustomers,
    findOrCreateCustomer
};
//# sourceMappingURL=customer.service.js.map