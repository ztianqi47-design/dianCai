const { callCloud } = require("./utils/cloud");

App({
  globalData: {
    user: null,
    family: null,
    registered: false,
    sessionPromise: null,
    demoMode: true,
    cloudEnv: "replace-with-your-cloud-env-id"
  },

  onLaunch() {
    if (this.globalData.demoMode) {
      this.bootstrapUser();
      return;
    }

    if (!wx.cloud) {
      wx.showModal({
        title: "初始化失败",
        content: "当前微信版本不支持云开发，请升级微信或基础库。",
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    });

    this.bootstrapUser();
  },

  async bootstrapUser() {
    try {
      const res = await callCloud("login", {
        action: "bootstrap"
      });
      this.globalData.user = res.user || null;
      this.globalData.family = res.family || null;
      this.globalData.registered = Boolean(res.registered && res.user);
      return res;
    } catch (err) {
      console.error("Failed to bootstrap user", err);
      this.globalData.user = null;
      this.globalData.family = null;
      this.globalData.registered = false;
      throw err;
    }
  }
});
