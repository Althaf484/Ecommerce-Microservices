import prisma from "@packages/libs/prisma";
import { create } from "domain";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.user_analytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: {
        actions: true,
      },
    });

    let updatedActions: any[] = existingData?.actions || [];

    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action,
    );

    // Always store product_view for recommendation
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: "product_view",
        timestamp: new Date(),
      });
    } else if (
      ["add_to_wishlist", "add_to_cart"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    } else if (["remove_from_cart"].includes(event.action) && actionExists) {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          entry.productId === event.productId || entry.action === "add_to_cart",
      );
    } else if (
      ["remove_from_wishlist"].includes(event.action) &&
      actionExists
    ) {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          entry.productId === event.productId ||
          entry.action === "add_to_wishlist",
      );
    }

    // keep only the last 100 actions
    if (updatedActions.length > 100) {
      updatedActions.shift();
    }

    const extraFields: Record<string, any> = {};

    if (event.country) {
      extraFields.country = event.country;
    }

    if (event.city) {
      extraFields.city = event.city;
    }

    if (event.device) {
      extraFields.device = event.device;
    }

    // update or create analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    // Also update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.log("Error updating user analytics", error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    //define update field dynamically
    const updateFilds: any = {};
    if (event.action === "product_view") {
      updateFilds.views = {
        increment: 1,
      };
    }

    if (event.action === "add_to-cart") {
      updateFilds.add_to_cart = {
        increment: 1,
      };
    }

    if (event.action === "remove_from_cart") {
      updateFilds.remove_from_cart = {
        decrement: 1,
      };
    }

    if (event.action === "add_to_wishlist") {
      updateFilds.add_to_wishlist = {
        increment: 1,
      };
    }

    if (event.action === "remove_from_wishlist") {
      updateFilds.remove_from_wishlist = {
        decrement: 1,
      };
    }

    if (event.action === "purchase") {
      updateFilds.purchases = {
        increment: 1,
      };
    }

    //update or create product analytics
    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFilds,
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.log("Error updating product analytics", error);
  }
};
