const { callMockFunction } = require("./mock");

function isDemoMode() {
  try {
    const app = getApp();
    return !app || !app.globalData || app.globalData.demoMode !== false;
  } catch (err) {
    return true;
  }
}

function showError(err, fallbackMessage) {
  console.error(fallbackMessage, err);
  wx.showToast({
    title: fallbackMessage,
    icon: "none"
  });
}

async function callCloud(name, data = {}) {
  if (isDemoMode()) {
    return callMockFunction(name, data);
  }

  const res = await wx.cloud.callFunction({
    name,
    data
  });
  return res.result || {};
}

async function chooseAndUploadImage(folder) {
  const chooseRes = await wx.chooseMedia({
    count: 1,
    mediaType: ["image"],
    sourceType: ["album", "camera"]
  });

  const file = chooseRes.tempFiles[0];
  if (isDemoMode()) {
    return file.tempFilePath;
  }

  const ext = file.tempFilePath.match(/\.[^.]+$/);
  const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? ext[0] : ".jpg"}`;

  const uploadRes = await wx.cloud.uploadFile({
    cloudPath,
    filePath: file.tempFilePath
  });

  return uploadRes.fileID;
}

module.exports = {
  callCloud,
  chooseAndUploadImage,
  isDemoMode,
  showError
};
