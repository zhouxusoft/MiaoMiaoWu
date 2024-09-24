// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
	data: {
		isLogin: false,
		user_avatar: '/images/cutedurk.png',
		nickname: '陌生人',
		confirmBtn: { content: '去登录', variant: 'base' },
		dialogKey: '',
		showConfirm: false,
		showWarnConfirm: false,
		showTooLongBtnContent: false,
		showMultiBtn: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		const accessToken = wx.getStorageSync('accessToken')
		// console.log(accessToken)
		this.checkLoginStatus(accessToken)
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},

	/**
	 * 检测用户是否登录
	 * @param {String} accessToken - 用户的登录凭证
	 */
	checkLoginStatus(accessToken) {
		const self = this
		wx.request({
			url: 'http://192.168.116.43:5000/check_session',
			method: 'POST',
			data: {
				accessToken: accessToken
			},
			success(res) {
				if (res.data.success) {
					self.setData({
						isLogin: true
					})
					console.log(res.data)
					// 更新用户信息
					wx.setStorageSync('user_id', res.data.userInfo[0])
					wx.setStorageSync('nickname', res.data.userInfo[1])
					wx.setStorageSync('avatar', res.data.userInfo[2])
					if (res.data.userInfo[1] != null) {
						self.setData({
							nickname: res.data.userInfo[1]
						})
					}
					if (res.data.userInfo[2] != null) {
						self.setData({
							user_avatar: res.data.userInfo[2]
						})
					}
				} else {
					console.error('登录失败！' + res.data.message);
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg);
			}
		})
	},

	/**
	 * 跳转至登录
	 */
	goToLogin() {
		if (!this.data.isLogin) {
			wx.switchTab({
				url: '/pages/about/about',
			})
		}
	},

	/**
	 * 显示跳转至登录
	 */
	showDialog(e) {
		if (!this.data.isLogin) {
			const { key } = e.currentTarget.dataset
			this.setData({ [key]: true, dialogKey: key })
		}
	},

	/**
	 * 取消跳转至登录
	 */
	closeDialog() {
		const { dialogKey } = this.data
		this.setData({ [dialogKey]: false })
	},

	/**
	 * 确认跳转至登录
	 */
	yesDialog() {
		const { dialogKey } = this.data;
		this.setData({ [dialogKey]: false })
		this.goToLogin()
	},
})
