// index.js
const app = getApp()

Page({
	data: {
		isLogin: false, // 用户的登录状态
		user_avatar: '/images/cutedurk.png', // 用户的默认头像
		nickname: '陌生人', // 用户的默认昵称
		confirmBtn: { content: '去登录', variant: 'base' }, // TDesign 组件库定义，设置弹窗的按钮显示
		dialogKey: '', // TDesign 组件库定义，用于设置弹窗状态
		showConfirm: false, // 弹窗显示状态
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
	 * 检测用户是否登录
	 * @param {String} accessToken - 用户的登录凭证
	 */
	checkLoginStatus(accessToken) {
		const self = this // 保存当前上下文，在回调函数或嵌套函数中，上下文会更改
		wx.request({
			url: `${app.globalData.baseUrl}/check_session`, // 后端判断用户登录的接口
			method: 'POST',
			data: {
				accessToken: accessToken // 传递用户登录凭证 accessToken
			},
			success(res) {
				if (res.data.success) { // 用户已登录
					self.setData({
						isLogin: true // 设置用户登录状态为 true
					})
					console.log(res.data)
					// 本地存储，更新用户信息
					wx.setStorageSync('user_id', res.data.userInfo[0])
					wx.setStorageSync('nickname', res.data.userInfo[1])
					wx.setStorageSync('avatar', res.data.userInfo[2])
					// 判断处理，防止信息为空
					if (res.data.userInfo[1] != null) {
						self.setData({
							nickname: res.data.userInfo[1] // 设置用户名
						})
					}
					if (res.data.userInfo[2] != null) {
						self.setData({
							user_avatar: res.data.userInfo[2] // 设置用户头像
						})
					}
				} else {
					// 若用户未登录， 设置相关数据
					self.setData({
						nickname: '陌生人',
						user_avatar: '/images/cutedurk.png',
						isLogin: false
					})
					console.error('登录失败！' + res.data.message)
				}
			},
			fail(err) {
				// 请求接口失败
				self.setData({
					nickname: '陌生人',
					user_avatar: '/images/cutedurk.png',
					isLogin: false
				})
				console.error('请求失败！' + err.errMsg)
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
