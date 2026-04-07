import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
// const Stripe = require("stripe");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2025-02-24.acacia",
// });

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exist with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res
      .status(200)
      .json({ mesage: "OTP sent to email. Please verify your account." });
  } catch (error) {
    return next(error);
  }
};

//verify user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new ValidationError("Missing required fields!");
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exist with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(String(password), 10);
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    return next(error);
  }
};

//login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Missing required fields!");
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid email or password!");
    }

    //checking password is correct or not
    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.password!,
    );
    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password!");
    }

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    //Generate access and refresh tokrn
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    //store the tokens in cokies
    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

// refresh token user
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      throw new AuthError("No refresh token provided!");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: number; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new JsonWebTokenError("Invalid refresh token!");
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: String(decoded.id) },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: String(decoded.id) },
        include: { shop: true },
      });
    }

    if (!account) {
      throw new AuthError("User/Seller not found!");
    }

    const newAccessToken = jwt.sign(
      { id: account.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

//get loggedin user info
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

//user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

//vverify otp for forgot password
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

//Reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ValidationError("Email and new password are required!");
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError("No account found with this email!");
    }

    // compare new password with old password
    const isSamePassword = await bcrypt.compare(
      String(newPassword),
      user.password!,
    );
    if (isSamePassword) {
      throw new ValidationError(
        "New password must be different from old password!",
      );
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    return next(error);
  }
};

//register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exist with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// verify seller with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, country, phone_number } = req.body;

    if (!email || !otp || !password || !name || !country || !phone_number) {
      throw new ValidationError("Missing required fields!");
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exist with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });
    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//ctreate a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !category || !sellerId) {
      throw new ValidationError("Missing required fields!");
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
      message: "Shop created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//create stripe connect account link for seller
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // try {
  //   const { sellerId } = req.body;
  //   if (!sellerId) {
  //     return next(new ValidationError("Seller ID is required"));
  //   }
  //   const seller = await prisma.sellers.findUnique({
  //     where: {
  //       id: sellerId,
  //     },
  //   });
  //   if (!seller) {
  //     return next(new ValidationError("Seller is not available with this id"));
  //   }
  //   const account = await stripe.accounts.create({
  //     type: "express",
  //     email: seller?.email,
  //     country: "IN",
  //     capabilities: {
  //       card_payments: { requested: true },
  //       transfers: { requested: true },
  //     },
  //   });
  //   await prisma.sellers.update({
  //     where: {
  //       id: sellerId,
  //     },
  //     data: {
  //       stripeId: account.id,
  //     },
  //   });
  //   const accountLink = await stripe.accountLinks.create({
  //     account: account.id,
  //     refresh_url: `http://localhost:3000/success`,
  //     return_url: `http://localhost:3000/success`,
  //     type: "account_onboarding",
  //   });
  //   res.json({ url: accountLink.url });
  // } catch (error) {
  //   return next(error);
  // }
};

// login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!seller) {
      return next(new ValidationError("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return next(new ValidationError("Invalid email or password"));
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    //generate refresh and access tokens
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);

    res.status(200).json({
      message: "Login successful",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("Missing required fields!"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.addresses.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.id;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found"));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// get user addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};
