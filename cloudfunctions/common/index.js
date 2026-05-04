const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

function now() {
  return db.serverDate();
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  const value = date instanceof Date ? date : new Date(date);
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  const hour = `${value.getHours()}`.padStart(2, "0");
  const minute = `${value.getMinutes()}`.padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

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

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = {
  _,
  cloud,
  db,
  formatDate,
  getCurrentUser,
  now,
  requireChef,
  sanitizeText
};
