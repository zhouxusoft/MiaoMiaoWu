// pages/about/about.js
import Message from 'tdesign-miniprogram/message/index'
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: false, // 用户登录状态
		user_avatar: '/images/cutedurk.png', // 用户头像
		nickname: '陌生人', // 用户昵称
		userInfo: null, // 用户个人信息
		confirmBtn: { content: '确认', variant: 'base' }, // TDesign 组件，用于设置弹窗按钮显示状态
		confirmBtnName: { content: '确认', variant: 'base', disabled: true }, // TDesign 组件，用于设置弹窗按钮显示状态
		dialogKey: '', // TDesign 组件，用于控制弹窗显示状态
		showConfirm: false, // 弹窗显示状态
		showConfirmName: false, // 弹窗显示状态
		userchangename: '', // 用户更改的昵称
		isChangeNameOK: false, // 用户昵称是否合规
		logining: false // 是否正在进行登录请求，用于防抖
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
							nickname: res.data.userInfo[1]
						})
					}
					if (res.data.userInfo[2] != null) {
						self.setData({
							user_avatar: res.data.userInfo[2]
						})
					}
				} else {
					// 若用户未登录， 设置相关数据
					console.error('登录失败！' + res.data.message)
				}
			},
			fail(err) {
				// 请求接口失败
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
		wx.clearStorageSync('accessToken') // 清除本地存储
		console.log("logout")
		this.updateUserInfo(false, '陌生人', '/images/cutedurk.png') //还原用户信息
		Message.success({	// 显示退出消息
			context: this,
			offset: [12, 32],
			duration: 3000,
			single: false,
			content: '期待下次相遇！',
		})
	},

	/**
	 * 登录请求
	 */
	login() {
		this.setData({
			logining: true // 设置当前正在登录中，用于防止用户多次点击
		})
		const self = this // 保存上下文
		/**
		 * 登录逻辑
		 * 通过 wx.login 拿到用户的专属的 code
		 * 把这个 code 发给后端，后端拿到这个 code 可以请求到用户的 openid(唯一标识)
		 */
		wx.login({
			success(res) {
				// console.log(666)
				if (res.code) {
					// 将 code 发送到后端服务器
					wx.request({
						url: `${app.globalData.baseUrl}/login`, // 登录接口
						method: 'POST',
						data: {
							code: res.code // 传输 code
						},
						success(res) {
							// 登录成功
							if (res.data.success) {
								// 保存 sessionToken 和 用户信息
								wx.setStorageSync('accessToken', res.data.accessToken)
								wx.setStorageSync('user_id', res.data.userInfo[0])
								wx.setStorageSync('nickname', res.data.userInfo[1])
								wx.setStorageSync('avatar', res.data.userInfo[2])
								self.updateUserInfo(true, res.data.userInfo[1], res.data.userInfo[2])
								// 获取用户信息
								console.log(res.data)
								// 判断异常，设置用户信息，改变页面显示内容
								if (!res.data['userInfo'][1] || !res.data['userInfo'][2]) {
									// console.log(66647)
									self.setData({
										showConfirm: true,
										dialogKey: 'showConfirm',
									})
								}
								self.setData({
									logining: false // 登录动作完成后，设置正在登录状态为 false
								})
								// 通知登录成功
								Message.success({
									context: this,
									offset: [12, 32],
									duration: 3000,
									single: false,
									content: '登录成功！',
								})
							} else {
								// 登录失败
								console.error('登录失败！' + res.data.message)
								self.setData({
									logining: false // 登录动作完成后，设置正在登录状态为 false
								})
								// 通知登陆失败
								Message.error({
									context: this,
									offset: [12, 32],
									duration: 3000,
									single: false,
									content: '登录失败！请稍后再试',
								})
							}
						},
						fail(err) {
							// 请求失败
							self.setData({
								logining: false // 登录动作完成后，设置正在登录状态为 false
							})
							console.error('请求失败！' + err.errMsg)
							// 通知请求失败
							Message.error({
								context: this,
								offset: [12, 32],
								duration: 3000,
								single: false,
								content: '登录失败！请稍后再试',
							})
						}
					});
				} else {
					// 请求失败
					console.error('登录失败！' + res.errMsg)
					// 通知
					Message.error({
						context: this,
						offset: [12, 32],
						duration: 3000,
						single: false,
						content: '登录失败！请稍后再试',
					})
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
	 * 更新页面显示用户信息
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