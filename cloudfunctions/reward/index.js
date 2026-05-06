const {
  cloud,
  db,
  formatDate,
  getCurrentUser,
  now,
  requireRegisteredUser,
  requireChef,
  sanitizeText
} = require("./common");

function normalizeMessage(message) {
  return {
    ...message,
    createTimeText: formatDate(message.createTime)
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "getChefRewardCode";
  const messages = db.collection("reward_messages");
  const user = await requireRegisteredUser(OPENID);

  if (action === "getChefRewardCode") {
    const res = await db.collection("users").where({
      role: "chef",
      familyId: user.familyId,
      registered: true
    }).limit(1).get();
    const chef = res.data[0] || {};
    return {
      rewardCodeUrl: chef.rewardCodeUrl || "",
      mealReadyTemplateId: chef.mealReadyTemplateId || ""
    };
  }

  if (action === "create") {
    const message = sanitizeText(event.message, 120);
    if (!message) {
      throw new Error("Reward message is required");
    }

    const addRes = await messages.add({
      data: {
        _openid: OPENID,
        familyId: user.familyId,
        order_id: sanitizeText(event.orderId, 80),
        message,
        createTime: now()
      }
    });

    return {
      messageId: addRes._id
    };
  }

  if (action === "listAll") {
    await requireChef(OPENID);
    const res = await messages.where({
      familyId: user.familyId
    }).orderBy("createTime", "desc").get();
    return {
      messages: res.data.map(normalizeMessage)
    };
  }

  throw new Error(`Unknown reward action: ${action}`);
};
