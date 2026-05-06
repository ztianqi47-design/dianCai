const {
  cloud,
  db,
  formatDate,
  requireRegisteredUser,
  now,
  requireChef,
  sanitizeText
} = require("./common");

function normalizeOrder(order) {
  return {
    ...order,
    createTimeText: formatDate(order.createTime),
    updateTimeText: formatDate(order.updateTime)
  };
}

function summarizeOrders(orders) {
  const map = {};
  orders.forEach((order) => {
    (order.dishList || []).forEach((dish) => {
      if (!map[dish.name]) {
        map[dish.name] = {
          name: dish.name,
          num: 0,
          method: dish.method || ""
        };
      }
      map[dish.name].num += Number(dish.num || 0);
      if (!map[dish.name].method && dish.method) {
        map[dish.name].method = dish.method;
      }
    });
  });
  return Object.values(map);
}

function normalizeDishList(dishList) {
  if (!Array.isArray(dishList) || !dishList.length) {
    throw new Error("Dish list is required");
  }

  return dishList.map((dish) => ({
    dishId: sanitizeText(dish.dishId, 80),
    name: sanitizeText(dish.name, 40),
    image: sanitizeText(dish.image, 300),
    method: sanitizeText(dish.method, 2000),
    num: Math.max(1, Number(dish.num || 1))
  }));
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "listMine";
  const orders = db.collection("orders");
  const user = await requireRegisteredUser(OPENID);

  if (action === "create") {
    const dishList = normalizeDishList(event.dishList);
    const addRes = await orders.add({
      data: {
        _openid: OPENID,
        familyId: user.familyId,
        dishList,
        status: 0,
        createTime: now(),
        updateTime: now()
      }
    });

    return {
      orderId: addRes._id
    };
  }

  if (action === "listMine") {
    const res = await orders.where({
      _openid: OPENID,
      familyId: user.familyId
    }).orderBy("createTime", "desc").get();
    return {
      orders: res.data.map(normalizeOrder)
    };
  }

  if (action === "listToday") {
    await requireChef(OPENID);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const res = await orders.where({
      familyId: user.familyId,
      createTime: db.command.gte(start)
    }).orderBy("createTime", "desc").get();

    return {
      orders: res.data.map(normalizeOrder),
      summary: summarizeOrders(res.data)
    };
  }

  if (action === "updateStatus") {
    await requireChef(OPENID);
    const status = Number(event.status);
    if (![0, 1, 2].includes(status)) {
      throw new Error("Invalid order status");
    }

    const orderRes = await orders.doc(event.orderId).get();
    if (!orderRes.data || orderRes.data.familyId !== user.familyId) {
      throw new Error("Order not found");
    }

    await orders.doc(event.orderId).update({
      data: {
        status,
        updateTime: now()
      }
    });

    return {
      ok: true
    };
  }

  throw new Error(`Unknown order action: ${action}`);
};
