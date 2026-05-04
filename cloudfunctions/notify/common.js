const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

async function getCurrentUser(openid) {
  const res = await db.collection("users").where({ _openid: openid }).limit(1).get();
  return res.data[0] || null;
}

async function requireChef(openid) {
  const user = await getCurrentUser(openid);
  if (!user || user.role !== "chef") {
    throw new Error("Only chef can perform this action");
  }
  return user;
}

module.exports = {
  cloud,
  db,
  requireChef
};
