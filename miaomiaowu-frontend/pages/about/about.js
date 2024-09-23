// pages/about/about.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: null,
		nickname: '陌生人'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		wx.login({
			success(res) {
				console.log(666)
				if (res.code) {
					// 将 code 发送到后端服务器
					// this.sendCodeToServer(res.code);
					wx.request({
						url: 'http://127.0.0.1:5000/login', // 登录接口
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

								// 获取用户信息
								// this.getUserProfile();
								console.log(res.data)
								if (res.data['userInfo'][1] == null || res.data['userInfo'][2] == null ) {
									// this.getUserProfile()
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

	sendCodeToServer(code) {
		wx.request({
			url: 'http://127.0.0.1:5000/login', // 登录接口
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
					url: 'http://127.0.0.1:5000/save_profile', // 替换成你服务器的保存用户信息接口
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
	}
})