const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

function now() {
  return db.serverDate();
}

async function getCurrentUser(openid) {
  const res = await db.collection("users").where({ _openid: openid }).limit(1).get();
  return res.data[0] || null;
}

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = {
  cloud,
  db,
  getCurrentUser,
  now,
  sanitizeText
};
