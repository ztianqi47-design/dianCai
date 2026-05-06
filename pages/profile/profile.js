const { callCloud, chooseAndUploadImage, showError } = require("../../utils/cloud");
const { ensureAuthenticated, updateCustomTabBar } = require("../../utils/auth");

Page({
  data: {
    user: null,
    family: null,
    nickname: "",
    mealReadyTemplateId: ""
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    updateCustomTabBar(this);
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const session = await ensureAuthenticated();
      if (!session.ok) {
        return;
      }

      const res = await callCloud("login", {
        action: "bootstrap"
      });
      this.setData({
        user: res.user,
        family: res.family || null,
        nickname: res.user.nickname || "",
        mealReadyTemplateId: res.user.mealReadyTemplateId || ""
      });
    } catch (err) {
      showError(err, "资料加载失败");
    }
  },

  onNicknameInput(event) {
    this.setData({
      nickname: event.detail.value
    });
  },

  onMealReadyTemplateInput(event) {
    this.setData({
      mealReadyTemplateId: event.detail.value
    });
  },

  async saveNickname() {
    try {
      await callCloud("login", {
        action: "updateProfile",
        nickname: this.data.nickname.trim()
      });
      wx.showToast({
        title: "已保存",
        icon: "success"
      });
      this.loadProfile();
    } catch (err) {
      showError(err, "保存失败");
    }
  },

  async uploadRewardCode() {
    if (!this.data.user || this.data.user.role !== "chef") {
      wx.showToast({
        title: "只有大厨可以上传",
        icon: "none"
      });
      return;
    }

    try {
      const rewardCodeUrl = await chooseAndUploadImage("reward-codes");
      await callCloud("login", {
        action: "updateRewardCode",
        rewardCodeUrl
      });
      wx.showToast({
        title: "赞赏码已更新",
        icon: "success"
      });
      this.loadProfile();
    } catch (err) {
      showError(err, "上传失败");
    }
  },

  async saveMealReadyTemplateId() {
    if (!this.data.user || this.data.user.role !== "chef") {
      wx.showToast({
        title: "只有大厨可以配置",
        icon: "none"
      });
      return;
    }

    try {
      await callCloud("login", {
        action: "updateMealReadyTemplateId",
        mealReadyTemplateId: this.data.mealReadyTemplateId.trim()
      });
      wx.showToast({
        title: "模板 ID 已保存",
        icon: "success"
      });
      this.loadProfile();
    } catch (err) {
      showError(err, "保存失败");
    }
  },

  async initPage() {
    const session = await ensureAuthenticated();
    if (!session.ok) {
      return;
    }

    updateCustomTabBar(this);
    this.loadProfile();
  },

  previewRewardCode() {
    if (!this.data.user || !this.data.user.rewardCodeUrl) {
      return;
    }

    wx.previewImage({
      urls: [this.data.user.rewardCodeUrl]
    });
  }
});
