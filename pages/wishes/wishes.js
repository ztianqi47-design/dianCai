const { callCloud, showError } = require("../../utils/cloud");
const { ensureAuthenticated, updateCustomTabBar } = require("../../utils/auth");

Page({
  data: {
    content: "",
    wishes: [],
    loading: false
  },

  onLoad() {
    this.initPage();
  },

  onPullDownRefresh() {
    this.loadWishes().finally(() => wx.stopPullDownRefresh());
  },

  onShow() {
    updateCustomTabBar(this);
  },

  onInput(event) {
    this.setData({
      content: event.detail.value
    });
  },

  async loadWishes() {
    const session = await ensureAuthenticated();
    if (!session.ok) {
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await callCloud("wish", {
        action: "list"
      });
      this.setData({
        wishes: res.wishes || []
      });
    } catch (err) {
      showError(err, "许愿加载失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async initPage() {
    const session = await ensureAuthenticated();
    if (!session.ok) {
      return;
    }

    updateCustomTabBar(this);
    this.loadWishes();
  },

  async submitWish() {
    const content = this.data.content.trim();
    if (!content) {
      wx.showToast({
        title: "写下想吃的菜名",
        icon: "none"
      });
      return;
    }

    try {
      await callCloud("wish", {
        action: "create",
        content
      });
      this.setData({ content: "" });
      wx.showToast({
        title: "许愿成功",
        icon: "success"
      });
      this.loadWishes();
    } catch (err) {
      showError(err, "许愿失败");
    }
  }
});
