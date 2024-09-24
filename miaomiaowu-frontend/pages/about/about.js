// pages/about/about.js
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
		confirmBtnName: { content: '确认', variant: 'base', disabled: true},
		dialogKey: '',
		showConfirm: false,
		showConfirmName: false,
		userchangename: '',
		isChangeNameOK: false
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

	sendCodeToServer(code) {
		wx.request({
			url: 'http://192.168.116.43:5000/login', // 登录接口
			method: 'POST',
			data: {
				code: code
			},
			success(res) {
				if (res.data.success) {
					// 保存 sessionToken
					wx.setStorageSync('sessionToken', res.data.sessionToken);
					// 获取用户信息
					this.getUserProfile();
				} else {
					console.error('登录失败！' + res.data.message);
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg);
			}
		});
	},

	getUserProfile() {
		wx.getUserProfile({
			desc: '用于完善会员资料', // 必填项，说明获取用户信息的用途
			success(res) {
				// 将用户信息发送到后端服务器
				wx.request({
					url: 'http://192.168.116.43:5000/save_profile', // 替换成你服务器的保存用户信息接口
					method: 'POST',
					data: {
						userInfo: res.userInfo
					},
					success(res) {
						if (res.data.success) {
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

	logout() {
		wx.clearStorageSync('accessToken')
		console.log("logout")
		this.updateUserInfo(false, '陌生人', '/images/cutedurk.png')
	},

	login() {
		const self = this
		wx.login({
			success(res) {
				// console.log(666)
				if (res.code) {
					// 将 code 发送到后端服务器
					wx.request({
						url: 'http://192.168.225.240:80/api/login', // 登录接口
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
										dialogKey: 'showConfirm'
									})
								}
							} else {
								console.error('登录失败！' + res.data.message);
							}
						},
						fail(err) {
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
		this.setData({ [dialogKey]: false })
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

	handleGetUserProfile() {
		const self = this
		console.log(858)
		wx.getUserProfile({
			desc: '用于完善会员资料', // 必填项，说明获取用户信息的用途
			success(res) {
				// 将用户信息发送到后端服务器
				wx.request({
					url: 'http://192.168.116.43:5000/save_profile',
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

	updateUserInfo(isLogin, nickname, user_avatar) {
		this.setData({
			isLogin: isLogin,
			nickname: nickname,
			user_avatar: user_avatar
		})
	},

	chooseAvatar(e) {
		this.setUserInfo(this.data.nickname, e.detail.avatarUrl)
	},

	showConfirmName(e) {
		const { key } = e.currentTarget.dataset
		this.setData({ [key]: true, dialogKey: key })
	},

	yesChangeName() {
		const { dialogKey } = this.data
		this.setData({ [dialogKey]: false })
		if (this.data.isChangeNameOK && this.data.userchangename != '') {
			this.setUserInfo(this.data.userchangename, this.data.user_avatar)
		}
		this.setData({
			confirmBtnName: { content: '确认', variant: 'base', disabled: true }
		})
	},

	nicknamereview(e){
		console.log(e)
		this.setData({
			isChangeNameOK: e.detail.pass
		})
		if (this.data.userchangename) {
			this.setData({
				confirmBtnName: { content: '确认', variant: 'base', disabled: false }
			})
		}
	},

	nicknameinput(e) {
		console.log(e)
		this.setData({
			userchangename: e.detail.value
		})
	},

	setUserInfo(nickname, avatarurl) {
		const self = this
		wx.request({
			url: 'http://192.168.116.43:5000/save_profile',
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
	}
})