const { callCloud, showError } = require("../../utils/cloud");
const { ensureAuthenticated, updateCustomTabBar } = require("../../utils/auth");

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
    viewingDishName: "",
    viewingDishMethod: "",
    loading: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    updateCustomTabBar(this);
    this.loadDashboard();
  },

  onPullDownRefresh() {
    this.loadDashboard().finally(() => wx.stopPullDownRefresh());
  },

  async loadDashboard() {
    const session = await ensureAuthenticated({ role: "chef" });
    if (!session.ok) {
      return;
    }

    this.setData({ loading: true });
    try {
      const [orderRes, rewardRes] = await Promise.all([
        callCloud("order", { action: "listToday" }),
        callCloud("reward", { action: "listAll" })
      ]);

      const orders = (orderRes.orders || []).map((order) => ({
        ...order,
        statusText: STATUS_TEXT[order.status] || "未知状态"
      }));

      this.setData({
        user: session.user,
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

  async initPage() {
    const session = await ensureAuthenticated({ role: "chef" });
    if (!session.ok) {
      return;
    }

    updateCustomTabBar(this);
    this.loadDashboard();
  },

  goDishes() {
    wx.navigateTo({
      url: "/pages/dishes/dishes"
    });
  },

  openMethod(event) {
    const item = event.currentTarget.dataset.item;
    this.setData({
      viewingDishName: item.name || "",
      viewingDishMethod: item.method || "这道菜还没有保存制作方式。"
    });
  },

  closeMethod() {
    this.setData({
      viewingDishName: "",
      viewingDishMethod: ""
    });
  },

  noop() {},

  async updateStatus(event) {
    const { id, status } = event.currentTarget.dataset;
    try {
      await callCloud("order", {
        action: "updateStatus",
        orderId: id,
        status: Number(status)
      });

      let toastTitle = "状态已更新";
      let toastIcon = "success";

      if (Number(status) === 2) {
        try {
          const notifyRes = await callCloud("notify", {
            action: "mealReady",
            orderId: id
          });

          if (notifyRes && notifyRes.skipped) {
            toastTitle = notifyRes.reason || "通知未发送";
            toastIcon = "none";
          }
        } catch (notifyErr) {
          console.error("Failed to send meal-ready notification", notifyErr);
          toastTitle = "状态已更新，通知失败";
          toastIcon = "none";
        }
      }

      wx.showToast({
        title: toastTitle,
        icon: toastIcon
      });
      this.loadDashboard();
    } catch (err) {
      showError(err, "状态更新失败");
    }
  }
});
