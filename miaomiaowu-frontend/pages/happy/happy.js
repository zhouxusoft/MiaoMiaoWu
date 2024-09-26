import { Toast } from 'tdesign-miniprogram'
const app = getApp()

// pages/watch/watch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: false, // 用户登录状态
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
		const self = this // 保存当前上下文，在回调函数或嵌套函数中，上下文会更改
		wx.request({
			url: `${app.globalData.baseUrl}/check_session`,	// 后端判断用户登录的接口
			method: 'POST',
			data: {
				accessToken: accessToken // 传递用户登录凭证 accessToken
			},
			success(res) {
				// 用户已登录
				if (res.data.success) {
					self.setData({
						isLogin: true // 设置用户登录状态
					})
					console.log(res.data)
					// 本地存储，更新用户信息
					wx.setStorageSync('user_id', res.data.userInfo[0])
					wx.setStorageSync('nickname', res.data.userInfo[1])
					wx.setStorageSync('avatar', res.data.userInfo[2])
					// 判断处理，防止信息为空
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
					// 用户未登录
					self.setData({
						isLogin: false
					})
					console.error('登录失败！' + res.data.message);
				}
			},
			fail(err) {
				// 请求失败
				self.setData({
					isLogin: false
				})
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