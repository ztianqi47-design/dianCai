const {
  cloud,
  db,
  formatDate,
  now,
  requireChef,
  sanitizeText
} = require("./common");

function normalizeWish(wish) {
  return {
    ...wish,
    createTimeText: formatDate(wish.createTime),
    updateTimeText: formatDate(wish.updateTime)
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const action = event.action || "list";
  const wishes = db.collection("wishes");

  if (action === "list") {
    const res = await wishes.orderBy("createTime", "desc").get();
    return {
      wishes: res.data.map(normalizeWish)
    };
  }

  if (action === "create") {
    const content = sanitizeText(event.content, 60);
    if (!content) {
      throw new Error("Wish content is required");
    }

    const addRes = await wishes.add({
      data: {
        _openid: OPENID,
        content,
        isFulfilled: false,
        createTime: now(),
        updateTime: now()
      }
    });

    return {
      wishId: addRes._id
    };
  }

  if (action === "fulfill") {
    await requireChef(OPENID);
    await wishes.doc(event.wishId).update({
      data: {
        isFulfilled: true,
        updateTime: now()
      }
    });
    return {
      ok: true
    };
  }

  throw new Error(`Unknown wish action: ${action}`);
};
