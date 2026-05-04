const { callCloud, showError } = require("../../utils/cloud");

const STATUS_TEXT = {
  0: "已点单",
  1: "做饭中",
  2: "已吃完"
};

Page({
  data: {
    user: null,
    orders: [],
    summary: [],
    rewardMessages: [],
    loading: false
  },

  onLoad() {
    this.loadDashboard();
  },

  onShow() {
    this.loadDashboard();
  },

  onPullDownRefresh() {
    this.loadDashboard().finally(() => wx.stopPullDownRefresh());
  },

  async loadDashboard() {
    this.setData({ loading: true });
    try {
      const loginRes = await callCloud("login");

      if (!loginRes.user || loginRes.user.role !== "chef") {
        this.setData({
          user: loginRes.user,
          orders: [],
          summary: [],
          rewardMessages: []
        });
        return;
      }

      const [orderRes, rewardRes] = await Promise.all([
        callCloud("order", { action: "listToday" }),
        callCloud("reward", { action: "listAll" })
      ]);

      const orders = (orderRes.orders || []).map((order) => ({
        ...order,
        statusText: STATUS_TEXT[order.status] || "未知状态"
      }));

      this.setData({
        user: loginRes.user,
        orders,
        summary: orderRes.summary || [],
        rewardMessages: rewardRes.messages || []
      });
    } catch (err) {
      showError(err, "工作台加载失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  goDishes() {
    wx.navigateTo({
      url: "/pages/dishes/dishes"
    });
  },

  async updateStatus(event) {
    const { id, status } = event.currentTarget.dataset;
    try {
      await callCloud("order", {
        action: "updateStatus",
        orderId: id,
        status: Number(status)
      });

      if (Number(status) === 2) {
        await callCloud("notify", {
          action: "mealReady",
          orderId: id
        });
      }

      wx.showToast({
        title: "状态已更新",
        icon: "success"
      });
      this.loadDashboard();
    } catch (err) {
      showError(err, "状态更新失败");
    }
  }
});
