import { AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

//get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExists = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountCodeExists) {
      return next(
        new ValidationError(
          "Discount code already exists! Please try another one.",
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    return res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

// get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: { sellerId: req.seller.id },
    });

    return res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    return next(error);
  }
};

//delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new ValidationError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    await prisma.discount_codes.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = [],
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing required fields!"));
    }

    if (!req.seller?.id) {
      return next(new AuthError("Only seller can create a product!"));
    }

    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugChecking) {
      return next(
        new ValidationError("Slug already exists! Please try another one."),
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        slug,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        shopId: req.seller?.shop?.id,
        cashOnDelivery: cash_on_delivery,
        brand,
        video_url,
        category,
        colors: colors || [],
        sizes: sizes || [],
        discount_codes: discountCodes?.map((codeId: string) => codeId) || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || [],
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
        subCategory,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await prisma.products.findMany({
      where: { shopId: req.seller?.shop?.id },
      include: {
        images: true,
      },
    });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

//delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found!"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product already deleted!"));
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product is sheduled for deletion in 24 hours. You can restore it within this time period.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

// restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found!"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state!" });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "Product restored successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Error restoring product", error });
  }
};

// get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    const baseFilter: Prisma.productsWhereInput = {
      OR: [
        { starting_date: null },
        { ending_date: null },
        { starting_date: { isSet: false } }, // important
        { ending_date: { isSet: false } }, // important
      ],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);
    console.log(products);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentpage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

//  get all events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        where: baseFilter,

        include: {
          images: true,
          shop: true,
        },
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: { totalSales: "desc" },
      }),
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentpage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// get product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        images: true,
        shop: true,
      },
    });

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

// get filtered products
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      OR: [
        { starting_date: null },
        { starting_date: { isSet: false } }, // field does not exist (MongoDB only)
      ],
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.color = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.size = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get filtered offers
export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.color = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.size = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get filtered shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          // followers: true, //to do remove now because of error there is no followers in shop schema
          products: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// serach products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: `Search query is required!` });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

// get top Shops
//todo in here fix the order schema
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Aggregate total sales per shop from orders
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 10,
    });

    // Fetch the corresponding shop details
    const shopIds = topShopsData.map((data: any) => data.shopId);

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avater: true,
        coverBanner: true,
        address: true,
        ratings: true,
        followers: true,
        category: true,
      },
    });

    // Merge sales with shop data
    const enrichedShops = shops.map((shop: any) => {
      const salesData = topShopsData.find(
        (data: any) => data.shopId === shop.id,
      );
      return {
        ...shop,
        totalSales: salesData ? salesData._sum.total : 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ success: true, shops: top10Shops });
  } catch (error) {
    return next(error);
  }
};
