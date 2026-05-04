const {
  cloud,
  db,
  formatDate,
  now,
  requireChef,
  sanitizeText
} = require("./common");

function normalizeDish(dish) {
  return {
    ...dish,
    createTimeText: formatDate(dish.createTime),
    updateTimeText: formatDate(dish.updateTime)
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "listActive";
  const dishes = db.collection("dishes");

  if (action === "listActive") {
    const res = await dishes.where({ isActive: true }).orderBy("updateTime", "desc").get();
    return {
      dishes: res.data.map(normalizeDish)
    };
  }

  if (action === "listAll") {
    await requireChef(OPENID);
    const res = await dishes.orderBy("createTime", "desc").get();
    return {
      dishes: res.data.map(normalizeDish)
    };
  }

  if (action === "create") {
    await requireChef(OPENID);
    const name = sanitizeText(event.name, 40);
    if (!name) {
      throw new Error("Dish name is required");
    }

    const addRes = await dishes.add({
      data: {
        _openid: OPENID,
        name,
        image: sanitizeText(event.image, 300),
        isActive: false,
        createTime: now(),
        updateTime: now()
      }
    });

    return {
      dishId: addRes._id
    };
  }

  if (action === "updateActive") {
    await requireChef(OPENID);
    await dishes.doc(event.dishId).update({
      data: {
        isActive: Boolean(event.isActive),
        updateTime: now()
      }
    });
    return {
      ok: true
    };
  }

  throw new Error(`Unknown dish action: ${action}`);
};
