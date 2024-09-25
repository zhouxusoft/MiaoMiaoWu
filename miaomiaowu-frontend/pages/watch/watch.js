// pages/watch/watch.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 标签状态
		tabPanelstyle: 'display:flex;justify-content:center;align-items:center;',
		// 顶部标签名称
		tabname: '正在追',
		// 判断滚动是否由 scrollToTop 触发
		isScrollToTop: 0,
		isLogin: false,
		dramaList: [],
		updateModes: [
			'连载中',
			'已完结',
			'未更新'
		],
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
		this.getDramaList()
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
					console.error('登录失败！' + res.data.message);
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg);
			}
		})
	},

	/**
	 * 切换顶部选项卡
	 * @param {*} event 
	 */
	onTabsChange(event) {
		this.scrollToTop()
		if (event.detail.value == 1) {
			this.data.tabname = '已看完'
		} else if (event.detail.value == 2) {
			this.data.tabname = '仅收藏'
		} else {
			this.data.tabname = '正在追'
		}
		// console.log(this.data.tabname)
	},

	/**
	 * 顶部选项卡点击触发
	 * @param {*}} event 
	 */
	onTabsClick(event) {
		console.log(`Click tab, tab-panel value is ${event.detail.value}.`)
	},

	onChange(e) {
		console.log(e.detail.value)
	},

	onPageScroll(e) {
		// console.log(this.data.isScrollToTop)
		if (e.scrollToTop == 0) {
			this.data.isScrollToTop = 0
		}
		// 非 scrollToTop 触发的页面滚动，才会执行
		if (this.data.isScrollToTop == 0) {
			// console.log('页面滚动距离:', e.scrollTop)
			this.changeTabName(e.scrollTop)
		}
	},

	scrollToTop: function () {
		this.data.isScrollToTop = 1
		wx.pageScrollTo({
			scrollTop: 0, // 滚动到页面顶部
			duration: 300 // 用于控制滚动动画的时间，单位：毫秒
		})
		setTimeout(() => {
			this.data.isScrollToTop = 0
			wx.setNavigationBarTitle({
				title: '我的追番',
			})
		}, 300)
	},

	changeTabName(scrollTop) {
		// console.log(this.data.tabname)
		if (scrollTop > 55) {
			wx.setNavigationBarTitle({
				title: this.data.tabname,
			})
		} else {
			wx.setNavigationBarTitle({
				title: '我的追番',
			})
		}
	},

	addWatch() {
		wx.navigateTo({
			url: '/pages/addwatch/addwatch',
		})
	},



	getDramaList() {
		const self = this
		const accessToken = wx.getStorageSync('accessToken')
		wx.request({
			url: `${app.globalData.baseUrl}/get_user_drama`,
			method: 'POST',
			data: {
				accessToken: accessToken
			},
			success(res) {
				if (res.data.success) {
					self.setData({
						dramaList: res.data.dramas
					})
					console.log(res.data)
					
					for (let i = 0; i < self.data.dramaList.length; i++) {
						self.data.dramaList[i][7] = self.data.updateModes[self.data.dramaList[i][7]]
					}
					self.setData({
						dramaList: self.data.dramaList
					})
					console.log(self.data.dramaList[0])
				} else {
					console.error('获取失败！' + res.data.message);
				}
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg);
			}
		})
	},


	properties: {
		navbarHeight: {
			type: Number,
			value: 0,
		},
	},
})