const { navigateToPath } = require("../utils/auth");

const MEMBER_TABS = [
  {
    text: "菜单",
    path: "/pages/index/index"
  },
  {
    text: "订单",
    path: "/pages/order/order"
  },
  {
    text: "许愿",
    path: "/pages/wishes/wishes"
  },
  {
    text: "我的",
    path: "/pages/profile/profile"
  }
];

const CHEF_TABS = [
  {
    text: "工作台",
    path: "/pages/chef/chef"
  },
  {
    text: "愿望池",
    path: "/pages/wishes/wishes"
  },
  {
    text: "我的",
    path: "/pages/profile/profile"
  }
];

Component({
  data: {
    selected: "",
    userRole: "",
    registered: false,
    tabs: MEMBER_TABS
  },

  observers: {
    userRole(value) {
      this.setData({
        tabs: value === "chef" ? CHEF_TABS : MEMBER_TABS
      });
    }
  },

  methods: {
    onChange(event) {
      const path = event.currentTarget.dataset.path;
      if (!path || path === this.data.selected) {
        return;
      }

      navigateToPath(path);
    }
  }
});
