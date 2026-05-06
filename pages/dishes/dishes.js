const { callCloud, chooseAndUploadImage, showError } = require("../../utils/cloud");
const { ensureAuthenticated, updateCustomTabBar } = require("../../utils/auth");

Page({
  data: {
    categories: ["素菜", "荤菜", "健身餐", "汤"],
    user: null,
    dishes: [],
    wishes: [],
    name: "",
    categoryIndex: 0,
    category: "素菜",
    description: "",
    image: "",
    loading: false
  },

  onLoad() {
    this.initPage();
  },

  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh());
  },

  onShow() {
    updateCustomTabBar(this);
  },

  onNameInput(event) {
    this.setData({
      name: event.detail.value
    });
  },

  onCategoryChange(event) {
    const categoryIndex = Number(event.detail.value || 0);
    this.setData({
      categoryIndex,
      category: this.data.categories[categoryIndex] || this.data.categories[0]
    });
  },

  onDescriptionInput(event) {
    this.setData({
      description: event.detail.value
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
    const session = await ensureAuthenticated({ role: "chef" });
    if (!session.ok) {
      return;
    }

    this.setData({ loading: true });
    try {
      const [dishRes, wishRes] = await Promise.all([
        callCloud("dish", { action: "listAll" }),
        callCloud("wish", { action: "list" })
      ]);
      this.setData({
        user: session.user,
        dishes: dishRes.dishes || [],
        wishes: (wishRes.wishes || []).filter((wish) => !wish.isFulfilled)
      });
    } catch (err) {
      showError(err, "菜库加载失败");
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
    this.loadData();
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
        category: this.data.category,
        description: this.data.description.trim(),
        image: this.data.image
      });
      this.setData({
        name: "",
        categoryIndex: 0,
        category: "素菜",
        description: "",
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
        category: "素菜",
        description: "",
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
