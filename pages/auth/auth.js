const { callCloud, showError } = require("../../utils/cloud");
const {
  getRoleHome,
  navigateToPath,
  refreshSession,
  setSession
} = require("../../utils/auth");

Page({
  data: {
    loading: false,
    mode: "member",
    nickname: "",
    familyName: "",
    inviteCode: ""
  },

  onShow() {
    this.bootstrap();
  },

  onModeChange(event) {
    this.setData({
      mode: event.currentTarget.dataset.mode
    });
  },

  onNicknameInput(event) {
    this.setData({
      nickname: event.detail.value
    });
  },

  onFamilyNameInput(event) {
    this.setData({
      familyName: event.detail.value
    });
  },

  onInviteCodeInput(event) {
    this.setData({
      inviteCode: event.detail.value
    });
  },

  async bootstrap() {
    this.setData({ loading: true });
    try {
      const session = await refreshSession();
      if (session.registered && session.user) {
        await navigateToPath(getRoleHome(session.user.role));
      }
    } catch (err) {
      showError(err, "登录状态检查失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async submitRegistration() {
    if (this.data.loading) {
      return;
    }

    const nickname = this.data.nickname.trim();
    const familyName = this.data.familyName.trim();
    const inviteCode = this.data.inviteCode.trim().toUpperCase();
    const role = this.data.mode === "chef" ? "chef" : "member";

    if (!nickname) {
      wx.showToast({
        title: "请输入昵称",
        icon: "none"
      });
      return;
    }

    if (role === "chef" && !familyName) {
      wx.showToast({
        title: "请输入家庭名称",
        icon: "none"
      });
      return;
    }

    if (role === "member" && !inviteCode) {
      wx.showToast({
        title: "请输入邀请码",
        icon: "none"
      });
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await callCloud("login", {
        action: "register",
        role,
        nickname,
        familyName,
        inviteCode
      });

      setSession({
        user: res.user,
        family: res.family,
        registered: true
      });

      wx.showToast({
        title: "注册成功",
        icon: "success"
      });

      await navigateToPath(getRoleHome(res.user.role));
    } catch (err) {
      showError(err, "注册失败");
    } finally {
      this.setData({ loading: false });
    }
  }
});
