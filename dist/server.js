"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const PORT = process.env.PORT || 5000;
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log("✅ Connected to database");
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Server failed to start:", error);
        await prisma_1.prisma.$disconnect();
        process.exit(1);
    }
}
main();
//# sourceMappingURL=server.js.map