"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("./app"));
// Export for Vercel serverless
async function handler(req, res) {
    await new Promise((resolve, reject) => {
        (0, app_1.default)(req, res, (err) => {
            if (err)
                reject(err);
            resolve(undefined);
        });
    });
}
//# sourceMappingURL=index.js.map