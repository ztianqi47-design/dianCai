const {
  cloud,
  db,
  getCurrentUser,
  now,
  sanitizeText
} = require("./common");

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "bootstrap";
  const users = db.collection("users");

  if (action === "updateProfile") {
    const nickname = sanitizeText(event.nickname, 24);
    await users.where({ _openid: OPENID }).update({
      data: {
        nickname,
        updateTime: now()
      }
    });
  }

  if (action === "updateRewardCode") {
    const currentUser = await getCurrentUser(OPENID);
    if (!currentUser || currentUser.role !== "chef") {
      throw new Error("Only chef can update reward code");
    }

    await users.where({ _openid: OPENID }).update({
      data: {
        rewardCodeUrl: sanitizeText(event.rewardCodeUrl, 300),
        updateTime: now()
      }
    });
  }

  let user = await getCurrentUser(OPENID);

  if (!user) {
    const countRes = await users.count();
    const role = countRes.total === 0 ? "chef" : "member";
    const addRes = await users.add({
      data: {
        _openid: OPENID,
        nickname: "",
        role,
        rewardCodeUrl: "",
        createTime: now(),
        updateTime: now()
      }
    });

    user = {
      _id: addRes._id,
      _openid: OPENID,
      nickname: "",
      role,
      rewardCodeUrl: ""
    };
  } else {
    user = await getCurrentUser(OPENID);
  }

  return {
    openid: OPENID,
    user
  };
};
