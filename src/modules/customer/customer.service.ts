import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


interface GetAllCustomersParams {
    search?: string;
    page: number;
    limit: number;
    skip: number;
}

 const getAllCustomers = async ({ search, page, limit, skip }: GetAllCustomersParams) => {
    const andConditions: Prisma.CustomerWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } }
            ]
        });
    }

    const data = await prisma.customer.findMany({
        where: {
            AND: andConditions
        },
        take: limit,
        skip,
        orderBy: { name: "asc" }
    });

    const total = await prisma.customer.count({
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
 const findOrCreateCustomer = async ({
    name,
    email,
    phone
}: {
    name: string;
    email?: string;
    phone?: string;
}) => {
    // Try to find existing customer by name + (email or phone)
    let customer = await prisma.customer.findFirst({
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
    customer = await prisma.customer.create({
        data: {
            name,
            email: email ?? null,
            phone: phone ?? null
        }
    });
}

    return customer;
};

export const customerService ={
getAllCustomers,
findOrCreateCustomer
}