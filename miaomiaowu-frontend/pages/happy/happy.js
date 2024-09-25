import { Toast } from 'tdesign-miniprogram'
const app = getApp()

// pages/watch/watch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		wx.showLoading({
			title: '加载中...',
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		wx.hideLoading()
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
	 * 用户点击跳转到 watch 页面
	 */
	goToWatch: function () {
		if (this.data.isLogin) {
			wx.navigateTo({
				url: '/pages/watch/watch'
			})
		} else {
			this.warnLogin()
		}
	},

	/**
	 * 用户点击跳转到 diary 页面
	 */
	goToDiary: function () {
		if (false) {
			wx.navigateTo({
				url: '/pages/diary/diary',
			})
		} else {
			this.notAble()
		}
	},

	/**
	 * 用户点击跳转到 chicken 页面
	 */
	goToChicken: function () {
		if (true) {
			wx.navigateTo({
				url: '/pages/chicken/chicken',
			})
		} else {
			this.warnLogin()
		}
	},

	/**
	 * 检测用户是否登录
	 * @param {String} accessToken - 用户的登录凭证
	 */
	checkLoginStatus(accessToken) {
		const self = this
		wx.request({
			url: `${app.globalData.baseUrl}/check_session`,
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
	 * Toast
	 * 未登录无法跳转
	 */
	warnLogin() {
		Toast({
			context: this,
			selector: '#t-toast',
			message: '登录后方可使用该功能',
		})
	},

	/**
	 * Toast
	 * 敬请期待
	 */
	notAble() {
		Toast({
			context: this,
			selector: '#t-toast',
			message: '敬请期待',
		})
	},
})