const { callCloud, chooseAndUploadImage, showError } = require("../../utils/cloud");

Page({
  data: {
    user: null,
    nickname: ""
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const res = await callCloud("login");
      this.setData({
        user: res.user,
        nickname: res.user.nickname || ""
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

  previewRewardCode() {
    if (!this.data.user || !this.data.user.rewardCodeUrl) {
      return;
    }

    wx.previewImage({
      urls: [this.data.user.rewardCodeUrl]
    });
  }
});
