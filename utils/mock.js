const state = {
  user: {
    _id: "mock_user_guest",
    _openid: "mock_openid_guest",
    nickname: "",
    role: "",
    familyId: "",
    familyName: "",
    registered: false,
    rewardCodeUrl: "",
    mealReadyTemplateId: ""
  },
  families: {
    chef: {
      _id: "family_001",
      name: "家里小食堂",
      inviteCode: "CHEF88",
      chefOpenid: "mock_openid_chef",
      rewardCodeUrl: "",
      mealReadyTemplateId: ""
    }
  },
  dishes: [
    {
      _id: "dish_001",
      familyId: "family_001",
      name: "番茄炒蛋",
      image: "",
      isActive: true,
      category: "素菜",
      description: "新鲜番茄与土鸡蛋的经典搭配",
      createTimeText: "今天 09:00"
    },
    {
      _id: "dish_002",
      familyId: "family_001",
      name: "红烧肉",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "肥而不腻，入口即化",
      createTimeText: "今天 09:10"
    },
    {
      _id: "dish_003",
      familyId: "family_001",
      name: "清炒时蔬",
      image: "",
      isActive: true,
      category: "素菜",
      description: "每日新鲜时蔬，清淡健康",
      createTimeText: "昨天 18:30"
    },
    {
      _id: "dish_004",
      familyId: "family_001",
      name: "麻婆豆腐",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "麻辣鲜香，下饭神器",
      createTimeText: "今天 09:20"
    },
    {
      _id: "dish_005",
      familyId: "family_001",
      name: "回锅肉",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "经典川味家常菜",
      createTimeText: "今天 09:25"
    },
    {
      _id: "dish_006",
      familyId: "family_001",
      name: "水煮鱼",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "鲜嫩鱼片配麻辣汤底",
      createTimeText: "今天 09:30"
    },
    {
      _id: "dish_007",
      familyId: "family_001",
      name: "鸡胸肉沙拉",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "低脂高蛋白，搭配时蔬",
      createTimeText: "今天 09:35"
    },
    {
      _id: "dish_008",
      familyId: "family_001",
      name: "糙米饭套餐",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "糙米饭配蒸蔬菜和鸡胸",
      createTimeText: "今天 09:40"
    },
    {
      _id: "dish_009",
      familyId: "family_001",
      name: "燕麦酸奶碗",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "燕麦、酸奶、坚果和水果",
      createTimeText: "今天 09:45"
    },
    {
      _id: "dish_010",
      familyId: "family_001",
      name: "冬瓜排骨汤",
      image: "",
      isActive: true,
      category: "汤",
      description: "清甜解腻，慢炖两小时",
      createTimeText: "今天 09:50"
    },
    {
      _id: "dish_011",
      familyId: "family_001",
      name: "番茄蛋花汤",
      image: "",
      isActive: true,
      category: "汤",
      description: "酸甜开胃，简单温暖",
      createTimeText: "今天 09:55"
    },
    {
      _id: "dish_012",
      familyId: "family_001",
      name: "菌菇鸡汤",
      image: "",
      isActive: true,
      category: "汤",
      description: "多种菌菇配土鸡慢炖",
      createTimeText: "今天 10:00"
    }
  ],
  orders: [
    {
      _id: "order_001",
      _openid: "mock_openid_chef",
      familyId: "family_001",
      dishList: [
        {
          dishId: "dish_001",
          name: "番茄炒蛋",
          image: "",
          num: 1
        }
      ],
      status: 1,
      createTimeText: "今天 11:30"
    }
  ],
  wishes: [
    {
      _id: "wish_001",
      _openid: "mock_openid_chef",
      familyId: "family_001",
      content: "糖醋排骨",
      isFulfilled: false,
      createTimeText: "今天 10:20"
    }
  ],
  rewardMessages: [
    {
      _id: "reward_001",
      _openid: "mock_openid_chef",
      familyId: "family_001",
      order_id: "order_001",
      message: "这顿饭太香了，给大厨加鸡腿！",
      createTimeText: "今天 12:20"
    }
  ]
};

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getNowText() {
  const date = new Date();
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `今天 ${hour}:${minute}`;
}

function summarizeOrders(orders) {
  const map = {};
  orders.forEach((order) => {
    order.dishList.forEach((dish) => {
      if (!map[dish.name]) {
        map[dish.name] = {
          name: dish.name,
          num: 0
        };
      }
      map[dish.name].num += Number(dish.num || 0);
    });
  });
  return Object.values(map);
}

function getCurrentFamily() {
  if (!state.user.familyId) {
    return null;
  }

  return Object.values(state.families).find((family) => family._id === state.user.familyId) || null;
}

function handleLogin(data) {
  if (data.action === "register") {
    const role = data.role === "chef" ? "chef" : "member";
    const nickname = String(data.nickname || "").trim();

    if (!nickname) {
      throw new Error("Nickname is required");
    }

    if (role === "chef") {
      const familyName = String(data.familyName || "").trim();
      if (!familyName) {
        throw new Error("Family name is required");
      }

      state.families.chef = {
        _id: "family_001",
        name: familyName,
        inviteCode: "CHEF88",
        chefOpenid: "mock_openid_chef",
        rewardCodeUrl: state.families.chef.rewardCodeUrl || "",
        mealReadyTemplateId: state.families.chef.mealReadyTemplateId || ""
      };

      state.user = {
        ...state.user,
        _id: "mock_user_chef",
        _openid: "mock_openid_chef",
        nickname,
        role: "chef",
        familyId: state.families.chef._id,
        familyName: state.families.chef.name,
        registered: true
      };
    } else {
      const inviteCode = String(data.inviteCode || "").trim().toUpperCase();
      if (inviteCode !== state.families.chef.inviteCode) {
        throw new Error("Invite code is invalid");
      }

      state.user = {
        ...state.user,
        _id: "mock_user_member",
        _openid: "mock_openid_member",
        nickname,
        role: "member",
        familyId: state.families.chef._id,
        familyName: state.families.chef.name,
        registered: true
      };
    }
  }

  if (data.action === "updateProfile") {
    if (!state.user.registered) {
      throw new Error("User is not registered");
    }
    state.user.nickname = String(data.nickname || "").trim();
  }

  if (data.action === "updateRewardCode") {
    if (state.user.role !== "chef") {
      throw new Error("Only chef can update reward code");
    }
    state.user.rewardCodeUrl = data.rewardCodeUrl || "";
    state.families.chef.rewardCodeUrl = state.user.rewardCodeUrl;
  }

  if (data.action === "updateMealReadyTemplateId") {
    if (state.user.role !== "chef") {
      throw new Error("Only chef can update meal-ready template");
    }
    state.user.mealReadyTemplateId = String(data.mealReadyTemplateId || "").trim();
    state.families.chef.mealReadyTemplateId = state.user.mealReadyTemplateId;
  }

  return {
    openid: state.user._openid,
    registered: Boolean(state.user.registered),
    user: state.user,
    family: getCurrentFamily()
  };
}

function handleDish(data) {
  if (!state.user.registered || !state.user.familyId) {
    throw new Error("User is not registered");
  }

  if (data.action === "listActive") {
    return {
      dishes: state.dishes
        .filter((dish) => dish.familyId === state.user.familyId && dish.isActive)
        .map((dish) => ({
          ...dish,
          category: dish.category || "素菜",
          description: dish.description || ""
        }))
    };
  }

  if (data.action === "listAll") {
    return {
      dishes: state.dishes.filter((dish) => dish.familyId === state.user.familyId).map((dish) => ({
        ...dish,
        category: dish.category || "素菜",
        description: dish.description || ""
      }))
    };
  }

  if (data.action === "create") {
    const dish = {
      _id: createId("dish"),
      familyId: state.user.familyId,
      name: String(data.name || "").trim(),
      image: data.image || "",
      category: String(data.category || "").trim() || "素菜",
      description: String(data.description || "").trim(),
      isActive: false,
      createTimeText: getNowText()
    };
    state.dishes.unshift(dish);
    return {
      dishId: dish._id
    };
  }

  if (data.action === "updateActive") {
    const dish = state.dishes.find((item) => item._id === data.dishId && item.familyId === state.user.familyId);
    if (dish) {
      dish.isActive = Boolean(data.isActive);
    }
    return {
      ok: true
    };
  }

  return {};
}

function handleOrder(data) {
  if (!state.user.registered || !state.user.familyId) {
    throw new Error("User is not registered");
  }

  if (data.action === "create") {
    const order = {
      _id: createId("order"),
      _openid: state.user._openid,
      familyId: state.user.familyId,
      dishList: data.dishList || [],
      status: 0,
      createTimeText: getNowText()
    };
    state.orders.unshift(order);
    return {
      orderId: order._id
    };
  }

  if (data.action === "listMine") {
    return {
      orders: state.orders.filter((order) => order._openid === state.user._openid && order.familyId === state.user.familyId)
    };
  }

  if (data.action === "listToday") {
    return {
      orders: state.orders.filter((order) => order.familyId === state.user.familyId),
      summary: summarizeOrders(state.orders.filter((order) => order.familyId === state.user.familyId))
    };
  }

  if (data.action === "updateStatus") {
    const order = state.orders.find((item) => item._id === data.orderId && item.familyId === state.user.familyId);
    if (order) {
      order.status = Number(data.status);
      order.updateTimeText = getNowText();
    }
    return {
      ok: true
    };
  }

  return {};
}

function handleWish(data) {
  if (!state.user.registered || !state.user.familyId) {
    throw new Error("User is not registered");
  }

  if (data.action === "list") {
    return {
      wishes: state.wishes.filter((wish) => wish.familyId === state.user.familyId)
    };
  }

  if (data.action === "create") {
    const wish = {
      _id: createId("wish"),
      _openid: state.user._openid,
      familyId: state.user.familyId,
      content: String(data.content || "").trim(),
      isFulfilled: false,
      createTimeText: getNowText()
    };
    state.wishes.unshift(wish);
    return {
      wishId: wish._id
    };
  }

  if (data.action === "fulfill") {
    const wish = state.wishes.find((item) => item._id === data.wishId && item.familyId === state.user.familyId);
    if (wish) {
      wish.isFulfilled = true;
      wish.updateTimeText = getNowText();
    }
    return {
      ok: true
    };
  }

  return {};
}

function handleReward(data) {
  if (!state.user.registered || !state.user.familyId) {
    throw new Error("User is not registered");
  }

  if (data.action === "getChefRewardCode") {
    const family = getCurrentFamily() || {};
    return {
      rewardCodeUrl: family.rewardCodeUrl || "",
      mealReadyTemplateId: family.mealReadyTemplateId || ""
    };
  }

  if (data.action === "create") {
    const message = {
      _id: createId("reward"),
      _openid: state.user._openid,
      familyId: state.user.familyId,
      order_id: data.orderId || "",
      message: String(data.message || "").trim(),
      createTimeText: getNowText()
    };
    state.rewardMessages.unshift(message);
    return {
      messageId: message._id
    };
  }

  if (data.action === "listAll") {
    return {
      messages: state.rewardMessages.filter((message) => message.familyId === state.user.familyId)
    };
  }

  return {};
}

async function callMockFunction(name, data = {}) {
  const handlers = {
    login: handleLogin,
    dish: handleDish,
    order: handleOrder,
    wish: handleWish,
    reward: handleReward,
    notify: () => ({
      skipped: true,
      reason: "Demo mode does not send subscription messages"
    })
  };

  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown mock function: ${name}`);
  }

  return handler(data);
}

module.exports = {
  callMockFunction
};
