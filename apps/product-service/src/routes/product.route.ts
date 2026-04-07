import express, { Router } from "express";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getProductDetails,
  getShopProducts,
  restoreProduct,
} from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-categories", getCategories);

router.post(
  "/create-discount-code",
  isAuthenticated,
  isSeller,
  createDiscountCodes,
);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete(
  "/delete-discount-code/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);
router.post("/create-product", isAuthenticated, isSeller, createProduct);
router.post("/get-shop-products", isAuthenticated, isSeller, getShopProducts);
router.delete(
  "/delete-product/:productId",
  isAuthenticated,
  isSeller,
  deleteProduct,
);
router.put(
  "/restore-product/:productId",
  isAuthenticated,
  isSeller,
  restoreProduct,
);
router.get("/get-all-products", getAllProducts);
router.get("/get-product/:slug", getProductDetails);

export default router;
