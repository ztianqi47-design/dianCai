const {
  cloud,
  db,
  requireChef
} = require("./common");

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "mealReady";

  if (action !== "mealReady") {
    throw new Error(`Unknown notify action: ${action}`);
  }

  await requireChef(OPENID);

  const orderRes = await db.collection("orders").doc(event.orderId).get();
  const order = orderRes.data;
  if (!order) {
    throw new Error("Order not found");
  }

  // Replace templateId after enabling subscription messages in WeChat MP console.
  const templateId = "";
  if (!templateId) {
    return {
      skipped: true,
      reason: "Subscription message templateId is not configured"
    };
  }

  const dishNames = (order.dishList || []).map((dish) => dish.name).join("、");
  await cloud.openapi.subscribeMessage.send({
    touser: order._openid,
    templateId,
    page: "pages/order/order",
    data: {
      thing1: {
        value: dishNames.slice(0, 20) || "今日点餐"
      },
      phrase2: {
        value: "已上桌"
      }
    }
  });

  return {
    ok: true
  };
};
