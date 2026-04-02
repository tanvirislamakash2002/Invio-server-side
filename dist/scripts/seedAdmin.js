"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../generated/prisma/enums");
const prisma_1 = require("../lib/prisma");
const seedAdmin = async () => {
    try {
        const adminData = {
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            role: enums_1.Role.ADMIN,
            password: process.env.ADMIN_PASSWORD
        };
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });
        if (existingUser) {
            throw new Error("User already exists!");
        }
        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(adminData)
        });
        if (signUpAdmin.ok) {
            await prisma_1.prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            });
        }
    }
    catch (error) {
        console.error(error);
    }
};
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map