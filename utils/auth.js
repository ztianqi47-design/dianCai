const TAB_PATHS = [
  "/pages/index/index",
  "/pages/order/order",
  "/pages/wishes/wishes",
  "/pages/chef/chef",
  "/pages/profile/profile"
];

const ROLE_HOME = {
  chef: "/pages/chef/chef",
  member: "/pages/index/index"
};

function getAppSafe() {
  try {
    return getApp();
  } catch (err) {
    return null;
  }
}

function getCurrentRoute() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  return current ? `/${current.route}` : "";
}

function navigateToPath(url) {
  if (!url) {
    return Promise.resolve();
  }

  if (TAB_PATHS.includes(url)) {
    return wx.switchTab({ url });
  }

  const currentRoute = getCurrentRoute();
  if (currentRoute === url) {
    return Promise.resolve();
  }

  return wx.redirectTo({ url });
}

async function refreshSession() {
  const app = getAppSafe();
  if (!app) {
    return {
      user: null,
      family: null,
      registered: false
    };
  }

  if (!app.globalData.sessionPromise) {
    app.globalData.sessionPromise = app.bootstrapUser().finally(() => {
      app.globalData.sessionPromise = null;
    });
  }

  const res = await app.globalData.sessionPromise;
  return {
    user: res.user || null,
    family: res.family || null,
    registered: Boolean(res.registered && res.user)
  };
}

function getSession() {
  const app = getAppSafe();
  if (!app) {
    return {
      user: null,
      family: null,
      registered: false
    };
  }

  return {
    user: app.globalData.user || null,
    family: app.globalData.family || null,
    registered: Boolean(app.globalData.registered && app.globalData.user)
  };
}

function setSession({ user, family, registered }) {
  const app = getAppSafe();
  if (!app) {
    return;
  }

  app.globalData.user = user || null;
  app.globalData.family = family || null;
  app.globalData.registered = Boolean(registered && user);
}

function getRoleHome(role) {
  return ROLE_HOME[role] || "/pages/index/index";
}

async function ensureAuthenticated(options = {}) {
  const {
    requireRegistered = true,
    role,
    redirectToAuth = true
  } = options;
  const session = await refreshSession();

  if (requireRegistered && !session.registered) {
    if (redirectToAuth && getCurrentRoute() !== "/pages/auth/auth") {
      await navigateToPath("/pages/auth/auth");
    }
    return {
      ok: false,
      reason: "unregistered",
      ...session
    };
  }

  if (role && session.user && session.user.role !== role) {
    const target = getRoleHome(session.user.role);
    if (target && getCurrentRoute() !== target) {
      wx.showToast({
        title: "当前账号无权限访问",
        icon: "none"
      });
      await navigateToPath(target);
    }
    return {
      ok: false,
      reason: "forbidden",
      ...session
    };
  }

  return {
    ok: true,
    ...session
  };
}

function updateCustomTabBar(page) {
  if (!page || typeof page.getTabBar !== "function") {
    return;
  }

  const tabBar = page.getTabBar();
  if (!tabBar || typeof tabBar.setData !== "function") {
    return;
  }

  const { user, registered } = getSession();
  const route = getCurrentRoute();

  tabBar.setData({
    userRole: user ? user.role : "",
    registered,
    selected: route
  });
}

module.exports = {
  ensureAuthenticated,
  getRoleHome,
  getSession,
  navigateToPath,
  refreshSession,
  setSession,
  updateCustomTabBar
};
