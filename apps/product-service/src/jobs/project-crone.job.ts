import prisma from "@packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    //Delete products where 'deletedAt' is older that 24 hours
    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });

    // console.log(
    //   `${deletedProducts.count} expired products permenently deleted`,
    // );
  } catch (error) {
    console.log(error);
  }
});
