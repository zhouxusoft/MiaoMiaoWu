// pages/about/about.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: null
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
								// 保存 sessionToken
								// wx.setStorageSync('sessionToken', res.data.sessionToken);
								// 获取用户信息
								// this.getUserProfile();
								console.log(res.data)
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
	}
})