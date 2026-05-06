const {
  cloud,
  db,
  getCurrentUser,
  requireChef
} = require("./common");

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "mealReady";

  if (action !== "mealReady") {
    throw new Error(`Unknown notify action: ${action}`);
  }

  const chef = await requireChef(OPENID);

  const orderRes = await db.collection("orders").doc(event.orderId).get();
  const order = orderRes.data;
  if (!order || order.familyId !== chef.familyId) {
    throw new Error("Order not found");
  }

  const fullChef = await getCurrentUser(OPENID);
  const templateId = (fullChef && fullChef.mealReadyTemplateId) || "";
  if (!templateId) {
    return {
      skipped: true,
      reason: "请先在我的页面配置通知模板 ID"
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
