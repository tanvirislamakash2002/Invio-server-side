import {
  OrderStatus,
  Priority,
  ProductStatus,
  Role,
  auth,
  prisma,
  prismaNamespace_exports
} from "./chunk-ECWGCTXZ.js";

// src/app.ts
import express4 from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/middlewares/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    statusCode = 500;
    errorMessage = "Prisma internal issue";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your credential!";
    }
    if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server!";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not found!",
    path: req.originalUrl,
    date: Date()
  });
};

// src/modules/upload/upload.route.ts
import express from "express";

// src/middlewares/auth.ts
var betterAuth;
var loadAuth = async () => {
  if (!betterAuth) {
    const authModule = await import("./auth-5NT4F7TQ.js");
    betterAuth = await authModule.auth;
  }
  return betterAuth;
};
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const authInstance = await loadAuth();
      const session = await authInstance.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email Verification required. Please verify your email!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/modules/upload/upload.controller.ts
import multer from "multer";

// src/modules/upload/upload.service.ts
import axios from "axios";
var uploadToImgbb = async (fileBuffer, fileName) => {
  if (!fileBuffer) {
    throw new Error("No file provided");
  }
  try {
    const base64Image = fileBuffer.toString("base64");
    const params = new URLSearchParams();
    params.append("image", base64Image);
    if (fileName) {
      const name = fileName.split(".")[0];
      params.append("name", `upload_${Date.now()}_${name}`);
    }
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 3e4
      }
    );
    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error(response.data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
    }
    throw new Error(error instanceof Error ? error.message : "Upload service unavailable");
  }
};
var uploadAvatar = async (userId, fileBuffer, fileName) => {
  try {
    const imageUrl = await uploadToImgbb(fileBuffer, fileName);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });
    return {
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: updatedUser.image,
        user: updatedUser
      }
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload avatar"
    };
  }
};
var uploadService = {
  uploadToImgbb,
  uploadAvatar
};

// src/modules/upload/upload.controller.ts
var storage = multer.memoryStorage();
var fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};
var upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
  // 2MB
});
var uploadPublicAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const imageUrl = await uploadService.uploadToImgbb(file.buffer, file.originalname);
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error("Public upload error:", error);
    next(error);
  }
};
var uploadAvatar2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const result = await uploadService.uploadAvatar(
      user.id,
      file.buffer,
      file.originalname
    );
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Upload controller error:", error);
    next(error);
  }
};
var uploadMiddleware = upload.single("file");
var publicUploadMiddleware = upload.single("file");
var uploadController = {
  uploadAvatar: uploadAvatar2,
  uploadPublicAvatar
};

// src/modules/upload/upload.route.ts
var router = express.Router();
router.post(
  "/avatar/public",
  publicUploadMiddleware,
  uploadController.uploadPublicAvatar
);
router.post(
  "/avatar",
  auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF),
  uploadMiddleware,
  uploadController.uploadAvatar
);
var uploadRouter = router;

// src/modules/category/category.route.ts
import express2 from "express";

// src/modules/category/category.service.ts
var categoryService = {
  getAll: async () => {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" }
    });
  },
  getById: async (id) => {
    return await prisma.category.findUnique({
      where: { id },
      include: { products: true }
    });
  },
  create: async (name, description) => {
    return await prisma.category.create({
      data: {
        name,
        ...description ? { description } : {}
      }
    });
  },
  update: async (id, name, description) => {
    return await prisma.category.update({
      where: { id },
      data: {
        name,
        ...description !== void 0 ? { description } : {}
      }
    });
  },
  delete: async (id) => {
    return await prisma.category.delete({
      where: { id }
    });
  }
};

// src/modules/category/category.controller.ts
var categoryController = {
  getAll: async (req, res, next) => {
    try {
      const data = await categoryService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await categoryService.getById(id);
      if (!data) return res.status(404).json({ success: false, message: "Category not found" });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const data = await categoryService.create(name, description);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const data = await categoryService.update(id, name, description);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await categoryService.delete(id);
      res.json({ success: true, message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  }
};

// src/modules/category/category.route.ts
var router2 = express2.Router();
router2.get("/", categoryController.getAll);
router2.get("/:id", categoryController.getById);
router2.post("/", auth_default(Role.ADMIN, Role.MANAGER), categoryController.create);
router2.patch("/:id", auth_default(Role.ADMIN, Role.MANAGER), categoryController.update);
router2.delete("/:id", auth_default(Role.ADMIN, Role.MANAGER), categoryController.delete);
var categoryRouter = router2;

// src/modules/product/product.route.ts
import express3 from "express";

// src/modules/product/product.service.ts
var productService = {
  getAll: async (params) => {
    const { page, limit, skip, search, categoryId, status } = params;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: true }
      }),
      prisma.product.count({ where })
    ]);
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit)
      }
    };
  },
  getById: async (id) => {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  },
  create: async (data) => {
    const status = data.stockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    const createData = {
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      stockQuantity: data.stockQuantity,
      minStockThreshold: data.minStockThreshold,
      status
    };
    if (data.description !== void 0 && data.description !== null) {
      createData.description = data.description;
    }
    const product = await prisma.product.create({
      data: createData,
      include: { category: true }
    });
    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId: product.id },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM
        },
        create: {
          productId: product.id,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM
        }
      });
    }
    return product;
  },
  update: async (id, data) => {
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) throw new Error("Product not found");
    const newStockQuantity = data.stockQuantity !== void 0 ? data.stockQuantity : currentProduct.stockQuantity;
    const newStatus = newStockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    const updateData = {
      status: newStatus
    };
    if (data.name !== void 0) updateData.name = data.name;
    if (data.description !== void 0) updateData.description = data.description || null;
    if (data.categoryId !== void 0) updateData.categoryId = data.categoryId;
    if (data.price !== void 0) updateData.price = data.price;
    if (data.stockQuantity !== void 0) updateData.stockQuantity = data.stockQuantity;
    if (data.minStockThreshold !== void 0) updateData.minStockThreshold = data.minStockThreshold;
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId: product.id },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : product.stockQuantity < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM
        },
        create: {
          productId: product.id,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM
        }
      });
    } else {
      await prisma.restockQueue.deleteMany({ where: { productId: product.id } });
    }
    return product;
  },
  delete: async (id) => {
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id }
    });
    if (orderItems) {
      throw new Error("Cannot delete product with existing orders");
    }
    await prisma.restockQueue.deleteMany({ where: { productId: id } });
    return await prisma.product.delete({ where: { id } });
  },
  checkActive: async (id) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { status: true, stockQuantity: true }
    });
    return product?.status === ProductStatus.ACTIVE && (product?.stockQuantity || 0) > 0;
  }
};

// src/modules/product/product.controller.ts
var productController = {
  getAll: async (req, res, next) => {
    try {
      const { page, limit, search, categoryId, status } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;
      const result = await productService.getAll({
        page: pageNum,
        limit: limitNum,
        skip,
        search,
        categoryId,
        status
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await productService.getById(id);
      if (!data)
        return res.status(404).json({ success: false, message: "Product not found" });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } = req.body;
      const data = await productService.create({
        name,
        description,
        categoryId,
        price,
        stockQuantity,
        minStockThreshold,
        status
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } = req.body;
      const data = await productService.update(id, {
        name,
        description,
        categoryId,
        price,
        stockQuantity,
        minStockThreshold,
        status
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await productService.delete(id);
      res.json({ success: true, message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }
};

// src/modules/product/product.route.ts
var router3 = express3.Router();
router3.get("/", productController.getAll);
router3.get("/:id", productController.getById);
router3.post("/", auth_default(Role.ADMIN, Role.MANAGER), productController.create);
router3.patch("/:id/edit", auth_default(Role.ADMIN, Role.MANAGER), productController.update);
router3.delete("/:id", auth_default(Role.ADMIN, Role.MANAGER), productController.delete);
var productRouter = router3;

// src/modules/order/order.route.ts
import { Router as Router2 } from "express";

// src/modules/activity/activity.service.ts
var activityService = {
  getRecent: async (limit = 10) => {
    return await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } }
      }
    });
  },
  getAll: async ({ page, limit, skip, sortBy, sortOrder, entityType, action }) => {
    const where = {};
    if (entityType) {
      where.entityType = entityType;
    }
    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { name: true, email: true } },
          order: { select: { orderNumber: true } }
        }
      }),
      prisma.activity.count({ where })
    ]);
    return {
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  // Helper method to create activity (used by other modules)
  create: async (data) => {
    return await prisma.activity.create({
      data: {
        action: data.action,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        orderId: data.orderId || null
      }
    });
  }
};

// src/modules/customer/customer.service.ts
var getAllCustomers = async ({ search, page, limit, skip }) => {
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
var findOrCreateCustomer = async ({
  name,
  email,
  phone
}) => {
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
var customerService = {
  getAllCustomers,
  findOrCreateCustomer
};

// src/modules/restock/restock.service.ts
var restockService = {
  getAll: async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [queue, total] = await Promise.all([
      prisma.restockQueue.findMany({
        skip,
        take: limit,
        orderBy: [
          { priority: "asc" },
          { currentStock: "asc" }
        ],
        include: {
          product: {
            include: { category: true }
          }
        }
      }),
      prisma.restockQueue.count()
    ]);
    const data = queue.map((item) => ({
      ...item,
      priorityLabel: item.priority === Priority.HIGH ? "High" : item.priority === Priority.MEDIUM ? "Medium" : "Low"
    }));
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  restock: async (productId, quantity, userId) => {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      throw new Error("Product not found");
    }
    const newStock = product.stockQuantity + quantity;
    const newStatus = newStock === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        status: newStatus
      }
    });
    if (newStock >= product.minStockThreshold) {
      await prisma.restockQueue.deleteMany({
        where: { productId }
      });
    } else {
      await prisma.restockQueue.update({
        where: { productId },
        data: {
          currentStock: newStock,
          priority: newStock === 0 ? Priority.HIGH : newStock < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM
        }
      });
    }
    await activityService.create({
      action: "STOCK_UPDATED",
      description: `Stock updated for "${product.name}" (+${quantity}), now ${newStock} units`,
      entityType: "PRODUCT",
      entityId: productId,
      userId
    });
    return updatedProduct;
  },
  remove: async (productId) => {
    const queueItem = await prisma.restockQueue.findUnique({
      where: { productId }
    });
    if (!queueItem) {
      throw new Error("Product not found in restock queue");
    }
    await prisma.restockQueue.delete({
      where: { productId }
    });
  },
  updateRestockQueue: async (productId) => {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) return;
    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : product.stockQuantity < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM
        },
        create: {
          productId,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM
        }
      });
    } else {
      await prisma.restockQueue.deleteMany({ where: { productId } });
    }
  }
};

// src/modules/order/order.service.ts
var orderService = {
  getAllOrders: async ({
    search,
    status,
    startDate,
    endDate,
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  }) => {
    const andConditions = [];
    if (search) {
      andConditions.push({
        OR: [
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { customer: { email: { contains: search, mode: "insensitive" } } },
          { customer: { phone: { contains: search, mode: "insensitive" } } },
          { orderNumber: { contains: search, mode: "insensitive" } }
        ]
      });
    }
    if (status) {
      andConditions.push({ status });
    }
    if (startDate || endDate) {
      andConditions.push({
        createdAt: {
          ...startDate && { gte: startDate },
          ...endDate && { lte: endDate }
        }
      });
    }
    const orders = await prisma.order.findMany({
      where: { AND: andConditions },
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder ?? "asc" },
      include: {
        items: { include: { product: { include: { category: true } } } },
        customer: true,
        user: true
      }
    });
    const total = await prisma.order.count({ where: { AND: andConditions } });
    return {
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit)
      }
    };
  },
  createOrder: async ({ customer, items, userId }) => {
    try {
      const productIds = items.map((i) => i.productId);
      const hasDuplicates = productIds.length !== new Set(productIds).size;
      if (hasDuplicates) {
        return { error: "This product is already added to the order." };
      }
      const customerRecord = await customerService.findOrCreateCustomer(customer);
      const orderItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return { error: `Product not found` };
        }
        if (product.status !== ProductStatus.ACTIVE) {
          return { error: `"${product.name}" is currently unavailable.` };
        }
        if (item.quantity > product.stockQuantity) {
          return { error: `Only ${product.stockQuantity} items available for "${product.name}"` };
        }
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity
        });
      }
      const totalPrice = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          totalPrice,
          userId,
          status: OrderStatus.PENDING,
          items: { create: orderItems }
        },
        include: { items: { include: { product: true } }, customer: true }
      });
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });
        await restockService.updateRestockQueue(item.productId);
      }
      await activityService.create({
        action: "ORDER_CREATED",
        description: `Order #${order.orderNumber} created`,
        entityType: "ORDER",
        entityId: order.id,
        userId,
        orderId: order.id
      });
      return { order };
    } catch (error) {
      return { error: error.message || "Something went wrong" };
    }
  },
  updateOrderStatus: async (orderId, status, userId) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!order) return { error: "Order not found" };
      if (order.status === OrderStatus.CANCELLED) {
        return { error: "Cannot update status of cancelled order" };
      }
      if (order.status === OrderStatus.DELIVERED && status !== OrderStatus.CANCELLED) {
        return { error: "Delivered orders cannot be modified" };
      }
      const validStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
      if (!validStatuses.includes(status)) {
        return { error: "Invalid status" };
      }
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      await activityService.create({
        action: "ORDER_STATUS_UPDATED",
        description: `Order #${order.orderNumber} status changed to ${status}`,
        entityType: "ORDER",
        entityId: order.id,
        userId,
        orderId: order.id
      });
      return { order: updatedOrder };
    } catch (error) {
      return { error: error.message };
    }
  },
  cancelOrder: async (orderId, userId) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!order) return { error: "Order not found" };
      if (order.status === OrderStatus.CANCELLED) {
        return { error: "Order is already cancelled" };
      }
      if (order.status === OrderStatus.DELIVERED) {
        return { error: "Delivered orders cannot be cancelled" };
      }
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });
        await restockService.updateRestockQueue(item.productId);
      }
      const cancelledOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED }
      });
      await activityService.create({
        action: "ORDER_CANCELLED",
        description: `Order #${order.orderNumber} cancelled`,
        entityType: "ORDER",
        entityId: order.id,
        userId,
        orderId: order.id
      });
      return { order: cancelledOrder };
    } catch (error) {
      return { error: error.message };
    }
  },
  updateOrder: async (orderId, { status, items, customer }) => {
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (!existingOrder) return { error: "Order not found" };
      if (existingOrder.status === OrderStatus.DELIVERED) {
        return { error: "Delivered orders cannot be updated" };
      }
      if (existingOrder.status === OrderStatus.CANCELLED) {
        return { error: "Cancelled orders cannot be updated" };
      }
      if (customer) {
        await prisma.customer.update({
          where: { id: existingOrder.customerId },
          data: customer
        });
      }
      let totalPrice = existingOrder.totalPrice;
      if (items) {
        const productIds = items.map((i) => i.productId);
        const hasDuplicates = productIds.length !== new Set(productIds).size;
        if (hasDuplicates) {
          return { error: "Duplicate products are not allowed in the same order" };
        }
        for (const item of existingOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } }
          });
          await restockService.updateRestockQueue(item.productId);
        }
        const newOrderItems = [];
        for (const item of items) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) return { error: `Product not found` };
          if (product.status !== ProductStatus.ACTIVE) return { error: `${product.name} is not available` };
          if (item.quantity > product.stockQuantity) return { error: `Only ${product.stockQuantity} items available for ${product.name}` };
          newOrderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity
          });
        }
        totalPrice = newOrderItems.reduce((sum, i) => sum + i.totalPrice, 0);
        await prisma.orderItem.deleteMany({ where: { orderId } });
        await prisma.orderItem.createMany({ data: newOrderItems.map((i) => ({ ...i, orderId })) });
        for (const item of newOrderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
          await restockService.updateRestockQueue(item.productId);
        }
      }
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          totalPrice,
          ...status !== void 0 ? { status } : {}
        },
        include: { items: { include: { product: true } }, customer: true }
      });
      if (status) {
        await activityService.create({
          action: "ORDER_UPDATED",
          description: `Order #${existingOrder.orderNumber} updated - status: ${status}`,
          entityType: "ORDER",
          entityId: orderId,
          userId: existingOrder.userId,
          orderId
        });
      }
      return { order: updatedOrder };
    } catch (error) {
      return { error: error.message || "Something went wrong" };
    }
  }
};

// src/helpers/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/order/order.controller.ts
var getOrders = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    const { page, limit, skip, sortBy, sortOrder: rawSortOrder } = paginationSortingHelper_default(req.query);
    const sortOrder = rawSortOrder === "desc" ? "desc" : "asc";
    const result = await orderService.getAllOrders({
      search: typeof search === "string" ? search : void 0,
      status: typeof status === "string" ? status : void 0,
      startDate: typeof startDate === "string" ? new Date(startDate) : void 0,
      endDate: typeof endDate === "string" ? new Date(endDate) : void 0,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
var createOrder = async (req, res, next) => {
  try {
    const { customer, items } = req.body;
    if (!customer || !customer.name) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Add at least one product to the order" });
    }
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized", user });
    }
    const result = await orderService.createOrder({
      customer,
      items,
      userId: user.id
    });
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json({ data: result.order });
  } catch (error) {
    next(error);
  }
};
var updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status, items, customer } = req.body;
    const user = req.user;
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    const result = await orderService.updateOrder(orderId, { status, items, customer });
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json({ data: result.order });
  } catch (error) {
    next(error);
  }
};
var updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const user = req.user;
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!status) return res.status(400).json({ error: "Status is required" });
    const result = await orderService.updateOrderStatus(orderId, status, user.id);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json({ success: true, data: result.order });
  } catch (error) {
    next(error);
  }
};
var cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const user = req.user;
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    const result = await orderService.cancelOrder(orderId, user.id);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(200).json({ success: true, message: "Order cancelled", data: result.order });
  } catch (error) {
    next(error);
  }
};
var orderController = {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder
};

// src/modules/order/order.route.ts
var router4 = Router2();
router4.get("/", auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF), orderController.getOrders);
router4.post("/", auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF), orderController.createOrder);
router4.patch("/:id/status", auth_default(Role.ADMIN, Role.MANAGER), orderController.updateOrderStatus);
router4.patch("/:id", auth_default(Role.ADMIN, Role.MANAGER), orderController.updateOrder);
router4.delete("/:id/cancel", auth_default(Role.ADMIN, Role.MANAGER), orderController.cancelOrder);
var orderRouter = router4;

// src/modules/customer/customer.route.ts
import { Router as Router3 } from "express";

// src/modules/customer/customer.controller.ts
var getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : void 0;
    const { page, limit, skip } = paginationSortingHelper_default(req.query);
    const result = await customerService.getAllCustomers({
      search: searchString || "",
      page,
      limit,
      skip
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
var createCustomerIfNotExist = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Customer name is required" });
    const customer = await customerService.findOrCreateCustomer({ name, email, phone });
    res.status(200).json({ data: customer });
  } catch (error) {
    next(error);
  }
};

// src/modules/customer/customer.route.ts
var router5 = Router3();
router5.get("/", auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF), getCustomers);
router5.post("/", auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF), createCustomerIfNotExist);
var customerRouter = router5;

// src/modules/restock/restock.route.ts
import { Router as Router4 } from "express";

// src/modules/restock/restock.controller.ts
var restockController = {
  getAll: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await restockService.getAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  restock: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Valid quantity is required" });
      }
      const result = await restockService.restock(productId, quantity, userId);
      res.status(201).json({ success: true, message: "Stock updated successfully", data: result });
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { productId } = req.params;
      await restockService.remove(productId);
      res.json({ success: true, message: "Product removed from restock queue" });
    } catch (error) {
      next(error);
    }
  }
};

// src/modules/restock/restock.route.ts
var router6 = Router4();
router6.get(
  "/",
  auth_default(Role.ADMIN, Role.MANAGER),
  restockController.getAll
);
router6.patch(
  "/:productId/restock",
  auth_default(Role.ADMIN, Role.MANAGER),
  restockController.restock
);
router6.delete(
  "/:productId",
  auth_default(Role.ADMIN, Role.MANAGER),
  restockController.remove
);
var restockRouter = router6;

// src/modules/activity/activity.route.ts
import { Router as Router5 } from "express";

// src/modules/activity/activity.controller.ts
var activityController = {
  getRecent: async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const data = await activityService.getRecent(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
      const { entityType, action } = req.query;
      const result = await activityService.getAll({
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
        entityType,
        action
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
};

// src/modules/activity/activity.route.ts
var router7 = Router5();
router7.get("/", auth_default(Role.ADMIN, Role.MANAGER, Role.STAFF), activityController.getRecent);
router7.get("/all", auth_default(Role.ADMIN, Role.MANAGER), activityController.getAll);
var activityRouter = router7;

// src/app.ts
var app = express4();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/invio-.*\.vercel\.app$/.test(origin) || // ← CHANGE to your frontend name
      /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express4.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/restock", restockRouter);
app.use("/api/v1/activity", activityRouter);
app.use("/api/v1/customer", customerRouter);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 5e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("\u2705 Connected to database");
    app_default.listen(PORT, () => {
      console.log(`\u{1F680} Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("\u274C Server failed to start:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
