const { callCloud, chooseAndUploadImage, showError } = require("../../utils/cloud");

Page({
  data: {
    user: null,
    dishes: [],
    wishes: [],
    name: "",
    image: "",
    loading: false
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh());
  },

  onNameInput(event) {
    this.setData({
      name: event.detail.value
    });
  },

  async chooseImage() {
    try {
      const image = await chooseAndUploadImage("dishes");
      this.setData({ image });
    } catch (err) {
      showError(err, "图片上传失败");
    }
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const loginRes = await callCloud("login");

      if (!loginRes.user || loginRes.user.role !== "chef") {
        this.setData({
          user: loginRes.user,
          dishes: [],
          wishes: []
        });
        return;
      }

      const [dishRes, wishRes] = await Promise.all([
        callCloud("dish", { action: "listAll" }),
        callCloud("wish", { action: "list" })
      ]);
      this.setData({
        user: loginRes.user,
        dishes: dishRes.dishes || [],
        wishes: (wishRes.wishes || []).filter((wish) => !wish.isFulfilled)
      });
    } catch (err) {
      showError(err, "菜库加载失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async createDish() {
    const name = this.data.name.trim();
    if (!name) {
      wx.showToast({
        title: "请输入菜名",
        icon: "none"
      });
      return;
    }

    try {
      await callCloud("dish", {
        action: "create",
        name,
        image: this.data.image
      });
      this.setData({
        name: "",
        image: ""
      });
      wx.showToast({
        title: "已加入菜库",
        icon: "success"
      });
      this.loadData();
    } catch (err) {
      showError(err, "新增失败");
    }
  },

  async toggleActive(event) {
    const dish = event.currentTarget.dataset.dish;
    try {
      await callCloud("dish", {
        action: "updateActive",
        dishId: dish._id,
        isActive: !dish.isActive
      });
      this.loadData();
    } catch (err) {
      showError(err, "上下架失败");
    }
  },

  async convertWish(event) {
    const wish = event.currentTarget.dataset.wish;
    try {
      await callCloud("dish", {
        action: "create",
        name: wish.content,
        image: ""
      });
      await callCloud("wish", {
        action: "fulfill",
        wishId: wish._id
      });
      wx.showToast({
        title: "愿望已安排",
        icon: "success"
      });
      this.loadData();
    } catch (err) {
      showError(err, "转入菜库失败");
    }
  }
});
