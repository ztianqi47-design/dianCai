const {
  cloud,
  db,
  getCurrentUser,
  now,
  sanitizeText
} = require("./common");

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function createUniqueInviteCode(families) {
  for (let i = 0; i < 8; i += 1) {
    const inviteCode = generateInviteCode();
    const exists = await families.where({ inviteCode }).limit(1).get();
    if (!exists.data.length) {
      return inviteCode;
    }
  }

  throw new Error("Failed to generate invite code");
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "bootstrap";
  const users = db.collection("users");
  const families = db.collection("families");

  if (action === "updateProfile") {
    const currentUser = await getCurrentUser(OPENID);
    if (!currentUser || !currentUser.registered) {
      throw new Error("User is not registered");
    }

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
    if (!currentUser || !currentUser.registered || currentUser.role !== "chef") {
      throw new Error("Only chef can update reward code");
    }

    await users.where({ _openid: OPENID }).update({
      data: {
        rewardCodeUrl: sanitizeText(event.rewardCodeUrl, 300),
        updateTime: now()
      }
    });
  }

  if (action === "updateMealReadyTemplateId") {
    const currentUser = await getCurrentUser(OPENID);
    if (!currentUser || !currentUser.registered || currentUser.role !== "chef") {
      throw new Error("Only chef can update meal-ready template");
    }

    await users.where({ _openid: OPENID }).update({
      data: {
        mealReadyTemplateId: sanitizeText(event.mealReadyTemplateId, 120),
        updateTime: now()
      }
    });
  }

  if (action === "register") {
    let currentUser = await getCurrentUser(OPENID);
    if (currentUser && currentUser.registered) {
      throw new Error("User already registered");
    }

    const role = event.role === "chef" ? "chef" : "member";
    const nickname = sanitizeText(event.nickname, 24);
    if (!nickname) {
      throw new Error("Nickname is required");
    }

    let family = null;
    let familyId = "";

    if (role === "chef") {
      const familyName = sanitizeText(event.familyName, 40);
      if (!familyName) {
        throw new Error("Family name is required");
      }

      const inviteCode = await createUniqueInviteCode(families);
      const familyRes = await families.add({
        data: {
          name: familyName,
          inviteCode,
          chefOpenid: OPENID,
          createTime: now(),
          updateTime: now()
        }
      });

      familyId = familyRes._id;
      family = {
        _id: familyId,
        name: familyName,
        inviteCode,
        chefOpenid: OPENID
      };
    } else {
      const inviteCode = sanitizeText(event.inviteCode, 12).toUpperCase();
      if (!inviteCode) {
        throw new Error("Invite code is required");
      }

      const familyRes = await families.where({ inviteCode }).limit(1).get();
      family = familyRes.data[0] || null;
      if (!family) {
        throw new Error("Invite code is invalid");
      }

      familyId = family._id;
    }

    const payload = {
      nickname,
      role,
      familyId,
      familyName: family.name || "",
      registered: true,
      rewardCodeUrl: currentUser && currentUser.rewardCodeUrl ? currentUser.rewardCodeUrl : "",
      mealReadyTemplateId: currentUser && currentUser.mealReadyTemplateId ? currentUser.mealReadyTemplateId : "",
      createTime: currentUser ? currentUser.createTime || now() : now(),
      updateTime: now()
    };

    if (currentUser) {
      await users.where({ _openid: OPENID }).update({
        data: payload
      });
    } else {
      const addRes = await users.add({
        data: {
          _openid: OPENID,
          ...payload
        }
      });

      currentUser = {
        _id: addRes._id,
        _openid: OPENID
      };
    }
  }

  let user = await getCurrentUser(OPENID);
  let family = null;

  if (!user) {
    const addRes = await users.add({
      data: {
        _openid: OPENID,
        nickname: "",
        role: "",
        familyId: "",
        familyName: "",
        registered: false,
        rewardCodeUrl: "",
        mealReadyTemplateId: "",
        createTime: now(),
        updateTime: now()
      }
    });

    user = {
      _id: addRes._id,
      _openid: OPENID,
      nickname: "",
      role: "",
      familyId: "",
      familyName: "",
      registered: false,
      rewardCodeUrl: "",
      mealReadyTemplateId: ""
    };
  } else {
    user = await getCurrentUser(OPENID);
  }

  if (user.familyId) {
    const familyRes = await families.doc(user.familyId).get().catch(() => ({ data: null }));
    family = familyRes.data || null;
  }

  return {
    openid: OPENID,
    registered: Boolean(user && user.registered),
    user,
    family
  };
};
