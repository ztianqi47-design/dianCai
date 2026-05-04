const { callCloud, showError } = require("../../utils/cloud");

Page({
  data: {
    categories: ["素菜", "荤菜", "健身餐", "汤"],
    activeCategory: "素菜",
    allDishes: [],
    filteredDishes: [],
    cart: {},
    cartTotalCount: 0,
    loading: false,
    submitting: false
  },

  onLoad() {
    this.loadDishes();
  },

  onPullDownRefresh() {
    this.loadDishes().finally(() => wx.stopPullDownRefresh());
  },

  async loadDishes() {
    this.setData({ loading: true });
    try {
      const res = await callCloud("dish", {
        action: "listActive"
      });
      this.setData({ allDishes: res.dishes || [] });
      this.filterDishesByCategory();
    } catch (err) {
      showError(err, "菜单加载失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  filterDishesByCategory() {
    const { allDishes, activeCategory } = this.data;
    const filteredDishes = allDishes.filter(
      dish => dish.category === activeCategory
    );
    this.setData({ filteredDishes });
  },

  onSideBarChange(e) {
    const activeCategory = e.detail.value;
    this.setData({ activeCategory });
    this.filterDishesByCategory();
  },

  onStepperChange(e) {
    const { value } = e.detail;
    const dishId = e.currentTarget.dataset.dishId;
    const cart = { ...this.data.cart };

    if (value <= 0) {
      delete cart[dishId];
    } else {
      const dish = this.data.allDishes.find(d => d._id === dishId);
      if (dish) {
        cart[dishId] = {
          dishId: dish._id,
          name: dish.name,
          image: dish.image || "",
          category: dish.category || "",
          description: dish.description || "",
          num: value
        };
      }
    }

    this.setData({ cart });
    this.updateCartSummary();
  },

  updateCartSummary() {
    const cartItems = Object.values(this.data.cart);
    const cartTotalCount = cartItems.reduce((sum, item) => sum + item.num, 0);
    this.setData({ cartTotalCount });
  },

  async submitOrder() {
    const cartItems = Object.values(this.data.cart);
    if (!cartItems.length || this.data.submitting) {
      wx.showToast({ title: "先选几道菜吧", icon: "none" });
      return;
    }

    this.setData({ submitting: true });
    try {
      await callCloud("order", {
        action: "create",
        dishList: cartItems
      });
      this.setData({ cart: {}, cartTotalCount: 0 });
      wx.showToast({ title: "点餐成功", icon: "success" });
      wx.switchTab({ url: "/pages/order/order" });
    } catch (err) {
      showError(err, "提交失败");
    } finally {
      this.setData({ submitting: false });
    }
  }
});
