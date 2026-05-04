const state = {
  user: {
    _id: "mock_user_chef",
    _openid: "mock_openid_chef",
    nickname: "家里大厨",
    role: "chef",
    rewardCodeUrl: ""
  },
  dishes: [
    {
      _id: "dish_001",
      name: "番茄炒蛋",
      image: "",
      isActive: true,
      category: "素菜",
      description: "新鲜番茄与土鸡蛋的经典搭配",
      createTimeText: "今天 09:00"
    },
    {
      _id: "dish_002",
      name: "红烧肉",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "肥而不腻，入口即化",
      createTimeText: "今天 09:10"
    },
    {
      _id: "dish_003",
      name: "清炒时蔬",
      image: "",
      isActive: true,
      category: "素菜",
      description: "每日新鲜时蔬，清淡健康",
      createTimeText: "昨天 18:30"
    },
    {
      _id: "dish_004",
      name: "麻婆豆腐",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "麻辣鲜香，下饭神器",
      createTimeText: "今天 09:20"
    },
    {
      _id: "dish_005",
      name: "回锅肉",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "经典川味家常菜",
      createTimeText: "今天 09:25"
    },
    {
      _id: "dish_006",
      name: "水煮鱼",
      image: "",
      isActive: true,
      category: "荤菜",
      description: "鲜嫩鱼片配麻辣汤底",
      createTimeText: "今天 09:30"
    },
    {
      _id: "dish_007",
      name: "鸡胸肉沙拉",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "低脂高蛋白，搭配时蔬",
      createTimeText: "今天 09:35"
    },
    {
      _id: "dish_008",
      name: "糙米饭套餐",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "糙米饭配蒸蔬菜和鸡胸",
      createTimeText: "今天 09:40"
    },
    {
      _id: "dish_009",
      name: "燕麦酸奶碗",
      image: "",
      isActive: true,
      category: "健身餐",
      description: "燕麦、酸奶、坚果和水果",
      createTimeText: "今天 09:45"
    },
    {
      _id: "dish_010",
      name: "冬瓜排骨汤",
      image: "",
      isActive: true,
      category: "汤",
      description: "清甜解腻，慢炖两小时",
      createTimeText: "今天 09:50"
    },
    {
      _id: "dish_011",
      name: "番茄蛋花汤",
      image: "",
      isActive: true,
      category: "汤",
      description: "酸甜开胃，简单温暖",
      createTimeText: "今天 09:55"
    },
    {
      _id: "dish_012",
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
      content: "糖醋排骨",
      isFulfilled: false,
      createTimeText: "今天 10:20"
    }
  ],
  rewardMessages: [
    {
      _id: "reward_001",
      _openid: "mock_openid_chef",
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

function handleLogin(data) {
  if (data.action === "updateProfile") {
    state.user.nickname = String(data.nickname || "").trim();
  }

  if (data.action === "updateRewardCode") {
    state.user.rewardCodeUrl = data.rewardCodeUrl || "";
  }

  return {
    openid: state.user._openid,
    user: state.user
  };
}

function handleDish(data) {
  if (data.action === "listActive") {
    return {
      dishes: state.dishes.filter((dish) => dish.isActive)
    };
  }

  if (data.action === "listAll") {
    return {
      dishes: state.dishes
    };
  }

  if (data.action === "create") {
    const dish = {
      _id: createId("dish"),
      name: String(data.name || "").trim(),
      image: data.image || "",
      category: data.category || "素菜",
      description: data.description || "",
      isActive: false,
      createTimeText: getNowText()
    };
    state.dishes.unshift(dish);
    return {
      dishId: dish._id
    };
  }

  if (data.action === "updateActive") {
    const dish = state.dishes.find((item) => item._id === data.dishId);
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
  if (data.action === "create") {
    const order = {
      _id: createId("order"),
      _openid: state.user._openid,
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
      orders: state.orders
    };
  }

  if (data.action === "listToday") {
    return {
      orders: state.orders,
      summary: summarizeOrders(state.orders)
    };
  }

  if (data.action === "updateStatus") {
    const order = state.orders.find((item) => item._id === data.orderId);
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
  if (data.action === "list") {
    return {
      wishes: state.wishes
    };
  }

  if (data.action === "create") {
    const wish = {
      _id: createId("wish"),
      _openid: state.user._openid,
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
    const wish = state.wishes.find((item) => item._id === data.wishId);
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
  if (data.action === "getChefRewardCode") {
    return {
      rewardCodeUrl: state.user.rewardCodeUrl
    };
  }

  if (data.action === "create") {
    const message = {
      _id: createId("reward"),
      _openid: state.user._openid,
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
      messages: state.rewardMessages
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
