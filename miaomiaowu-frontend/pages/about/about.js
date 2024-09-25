// pages/about/about.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: false,
		user_avatar: '/images/cutedurk.png',
		nickname: '陌生人',
		userInfo: null,
		confirmBtn: { content: '确认', variant: 'base' },
		confirmBtnName: { content: '确认', variant: 'base', disabled: true },
		dialogKey: '',
		showConfirm: false,
		showConfirmName: false,
		userchangename: '',
		isChangeNameOK: false,
		logining: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const accessToken = wx.getStorageSync('accessToken')
		// console.log(accessToken)
		this.checkLoginStatus(accessToken)
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
					console.error('登录失败！' + res.data.message)
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg)
			}
		})
	},

	/**
	 * 通过官方接口获取用户信息，方法已弃用
	 */
	getUserProfile() {
		wx.getUserProfile({
			desc: '用于完善会员资料', // 必填项，说明获取用户信息的用途
			success(res) {
				// 将用户信息发送到后端服务器
				wx.request({
					url: `${app.globalData.baseUrl}/save_profile`,
					method: 'POST',
					data: {
						userInfo: res.userInfo
					},
					success(res) {
						if (res.data.success) {
							console.log(res.data)
						} else {
							console.error('保存用户信息失败！' + res.data.message)
						}
					},
					fail(err) {
						console.error('请求失败！' + err.errMsg)
					}
				});
			},
			fail(err) {
				console.error('获取用户信息失败！' + err.errMsg)
			}
		})
	},

	/**
	 * 退出登录
	 */
	logout() {
		wx.clearStorageSync('accessToken')
		console.log("logout")
		this.updateUserInfo(false, '陌生人', '/images/cutedurk.png')
	},

	/**
	 * 登录请求
	 */
	login() {
		this.setData({
			logining: true
		})
		const self = this
		wx.login({
			success(res) {
				// console.log(666)
				if (res.code) {
					// 将 code 发送到后端服务器
					wx.request({
						url: `${app.globalData.baseUrl}/login`,
						method: 'POST',
						data: {
							code: res.code
						},
						success(res) {
							if (res.data.success) {
								// 保存 sessionToken 和 用户信息
								wx.setStorageSync('accessToken', res.data.accessToken)
								wx.setStorageSync('user_id', res.data.userInfo[0])
								wx.setStorageSync('nickname', res.data.userInfo[1])
								wx.setStorageSync('avatar', res.data.userInfo[2])
								self.updateUserInfo(true, res.data.userInfo[1], res.data.userInfo[2])
								// 获取用户信息
								console.log(res.data)
								if (!res.data['userInfo'][1] || !res.data['userInfo'][2]) {
									// console.log(66647)
									self.setData({
										showConfirm: true,
										dialogKey: 'showConfirm',
									})
								}
								self.setData({
									logining: false
								})
							} else {
								console.error('登录失败！' + res.data.message)
								self.setData({
									logining: false
								})
							}
						},
						fail(err) {
							self.setData({
								logining: false
							})
							console.error('请求失败！' + err.errMsg);
						}
					});
				} else {
					console.error('登录失败！' + res.errMsg);
				}
			}
		})
	},

	/**
	 * 显示授权微信头像、昵称
	 */
	showDialog(e) {
		const { key } = e.currentTarget.dataset
		this.setData({ [key]: true, dialogKey: key })
	},

	/**
	 * 取消显示授权微信头像、昵称
	 */
	closeDialog() {
		const { dialogKey } = this.data
		this.setData({
			[dialogKey]: false,
			userchangename: '',
			isChangeNameOK: false
		})
	},

	/**
	 * 确认显示授权微信头像、昵称
	 */
	yesDialog() {
		const { dialogKey } = this.data;
		this.setData({ [dialogKey]: false })
		this.handleGetUserProfile()
		console.log(484)
	},

	/**
	 * 授权用户的头像、昵称（已废弃）
	 */
	handleGetUserProfile() {
		const self = this
		console.log(858)
		wx.getUserProfile({
			desc: '用于完善会员资料', // 必填项，说明获取用户信息的用途
			success(res) {
				// 将用户信息发送到后端服务器
				wx.request({
					url: `${app.globalData.baseUrl}/save_profile`,
					method: 'POST',
					data: {
						userInfo: res.userInfo,
						accessToken: wx.getStorageSync('accessToken')
					},
					success(res) {
						if (res.data.success) {
							self.updateUserInfo(true, res.data.userInfo[1], res.data.userInfo[2])
							console.log(res.data)
						} else {
							console.error('保存用户信息失败！' + res.data.message);
						}
					},
					fail(err) {
						console.error('请求失败！' + err.errMsg);
					}
				});
			},
			fail(err) {
				console.error('获取用户信息失败！' + err.errMsg);
			}
		});
	},

	/**
	 * 修改用户信息
	 * @param {boolean} isLogin 
	 * @param {String} nickname 
	 * @param {String} user_avatar 
	 */
	updateUserInfo(isLogin, nickname, user_avatar) {
		this.setData({
			isLogin: isLogin,
			nickname: nickname,
			user_avatar: user_avatar
		})
	},

	/**
	 * 修改头像时触发
	 * @param {*} e 
	 */
	chooseAvatar(e) {
		this.setUserInfo(this.data.nickname, e.detail.avatarUrl)
	},

	/**
	 * 显示修改昵称的弹框
	 * @param {*} e 
	 */
	showConfirmName(e) {
		const { key } = e.currentTarget.dataset
		this.setData({ [key]: true, dialogKey: key })
	},

	/**
	 * 确定修改昵称
	 */
	yesChangeName() {
		const { dialogKey } = this.data
		this.setData({ [dialogKey]: false })
		if (this.data.isChangeNameOK && this.data.userchangename != '') {
			this.setUserInfo(this.data.userchangename, this.data.user_avatar)
		}
		this.setData({
			confirmBtnName: { content: '确认', variant: 'base', disabled: true },
			userchangename: '',
			isChangeNameOK: false
		})
	},

	/**
	 * 检测用户名是否合法
	 * @param {*} e 
	 */
	nicknamereview(e) {
		// console.log(e)
		this.setData({
			isChangeNameOK: e.detail.pass
		})
		if (this.data.userchangename != '') {
			this.setData({
				confirmBtnName: { content: '确认', variant: 'base', disabled: false }
			})
		}
	},

	/**
	 * 修改名称输入框值发生变化时，注意，开发者工具的模拟器，自动填充的 微信名称 不会触发 input 事件， 但会触发 change 事件，而 change 事件， 官方文档并没有记录
	 * @param {*} e 
	 */
	nicknameinput(e) {
		// console.log(e)
		this.setData({
			userchangename: e.detail.value
		})
		if (this.data.userchangename == '') {
			this.setData({
				confirmBtnName: { content: '确认', variant: 'base', disabled: true }
			})
		}
	},

	/**
	 * 修改用户名和头像
	 * @param {String} nickname 
	 * @param {String} avatarurl 
	 */
	setUserInfo(nickname, avatarurl) {
		const self = this
		wx.request({
			url: `${app.globalData.baseUrl}/save_profile`,
			method: 'POST',
			data: {
				userInfo: {
					nickName: nickname,
					avatarUrl: avatarurl
				},
				accessToken: wx.getStorageSync('accessToken')
			},
			success(res) {
				if (res.data.success) {
					self.updateUserInfo(true, res.data.userInfo[1], res.data.userInfo[2])
					console.log(res.data)
				} else {
					console.error('保存用户信息失败！' + res.data.message)
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg)
			}
		})
	},
})