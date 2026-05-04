const {
  cloud,
  db,
  formatDate,
  getCurrentUser,
  now,
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
  const users = db.collection("users");
  const messages = db.collection("reward_messages");

  if (action === "getChefRewardCode") {
    const res = await users.where({ role: "chef" }).limit(1).get();
    const chef = res.data[0] || {};
    return {
      rewardCodeUrl: chef.rewardCodeUrl || ""
    };
  }

  if (action === "create") {
    const user = await getCurrentUser(OPENID);
    if (!user) {
      throw new Error("User is required");
    }

    const message = sanitizeText(event.message, 120);
    if (!message) {
      throw new Error("Reward message is required");
    }

    const addRes = await messages.add({
      data: {
        _openid: OPENID,
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
    const res = await messages.orderBy("createTime", "desc").get();
    return {
      messages: res.data.map(normalizeMessage)
    };
  }

  throw new Error(`Unknown reward action: ${action}`);
};
