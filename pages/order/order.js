const { callCloud, showError } = require("../../utils/cloud");
const { ensureAuthenticated, updateCustomTabBar } = require("../../utils/auth");

const STATUS_TEXT = {
  0: "已点单",
  1: "做饭中",
  2: "已吃完"
};

Page({
  data: {
    orders: [],
    rewardCodeUrl: "",
    rewardOrderId: "",
    rewardMessage: "",
    loading: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    updateCustomTabBar(this);
    if (this.data.orders.length || this.data.loading) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    const session = await ensureAuthenticated({ role: "member" });
    if (!session.ok) {
      return;
    }

    this.setData({ loading: true });
    try {
      const [orderRes, rewardRes] = await Promise.all([
        callCloud("order", { action: "listMine" }),
        callCloud("reward", { action: "getChefRewardCode" })
      ]);
      const orders = (orderRes.orders || []).map((order) => ({
        ...order,
        statusText: STATUS_TEXT[order.status] || "未知状态"
      }));
      this.setData({
        orders,
        rewardCodeUrl: rewardRes.rewardCodeUrl || ""
      });
    } catch (err) {
      showError(err, "订单加载失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async initPage() {
    const session = await ensureAuthenticated({ role: "member" });
    if (!session.ok) {
      return;
    }

    updateCustomTabBar(this);
    this.loadData();
  },

  openReward(event) {
    this.setData({
      rewardOrderId: event.currentTarget.dataset.id,
      rewardMessage: ""
    });
  },

  closeReward() {
    this.setData({
      rewardOrderId: "",
      rewardMessage: ""
    });
  },

  onRewardInput(event) {
    this.setData({
      rewardMessage: event.detail.value
    });
  },

  previewRewardCode() {
    if (!this.data.rewardCodeUrl) {
      wx.showToast({
        title: "大厨还没上传赞赏码",
        icon: "none"
      });
      return;
    }

    wx.previewImage({
      urls: [this.data.rewardCodeUrl]
    });
  },

  async submitRewardMessage() {
    if (!this.data.rewardMessage.trim()) {
      wx.showToast({
        title: "写点夸夸大厨的话吧",
        icon: "none"
      });
      return;
    }

    try {
      await callCloud("reward", {
        action: "create",
        orderId: this.data.rewardOrderId,
        message: this.data.rewardMessage.trim()
      });
      wx.showToast({
        title: "留言已送达",
        icon: "success"
      });
      this.closeReward();
    } catch (err) {
      showError(err, "留言失败");
    }
  }
});
