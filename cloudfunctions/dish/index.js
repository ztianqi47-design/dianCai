const {
  cloud,
  db,
  formatDate,
  now,
  requireRegisteredUser,
  requireChef,
  sanitizeText
} = require("./common");

function normalizeDish(dish) {
  return {
    ...dish,
    category: dish.category || "素菜",
    description: dish.description || "",
    createTimeText: formatDate(dish.createTime),
    updateTimeText: formatDate(dish.updateTime)
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "listActive";
  const dishes = db.collection("dishes");
  const user = await requireRegisteredUser(OPENID);

  if (action === "listActive") {
    const res = await dishes.where({
      familyId: user.familyId,
      isActive: true
    }).orderBy("updateTime", "desc").get();
    return {
      dishes: res.data.map(normalizeDish)
    };
  }

  if (action === "listAll") {
    await requireChef(OPENID);
    const res = await dishes.where({
      familyId: user.familyId
    }).orderBy("createTime", "desc").get();
    return {
      dishes: res.data.map(normalizeDish)
    };
  }

  if (action === "create") {
    await requireChef(OPENID);
    const name = sanitizeText(event.name, 40);
    const category = sanitizeText(event.category, 20) || "素菜";
    const description = sanitizeText(event.description, 120);
    if (!name) {
      throw new Error("Dish name is required");
    }

    const addRes = await dishes.add({
      data: {
        _openid: OPENID,
        familyId: user.familyId,
        name,
        category,
        description,
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
    const dishRes = await dishes.doc(event.dishId).get();
    if (!dishRes.data || dishRes.data.familyId !== user.familyId) {
      throw new Error("Dish not found");
    }

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
