import app from "./app";

// Export for Vercel serverless
export default async function handler(req: any, res: any) {
  await new Promise((resolve, reject) => {
    app(req, res, (err: any) => {
      if (err) reject(err);
      resolve(undefined);
    });
  });
}