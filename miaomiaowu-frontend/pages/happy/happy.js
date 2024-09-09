// pages/watch/watch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

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

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		wx.hideLoading()
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
		wx.navigateTo({
			url: '/pages/watch/watch'
		});
	},

	/**
	 * 用户点击跳转到 diary 页面
	 */
	goToDiary: function () {
		wx.navigateTo({
			url: '/pages/diary/diary',
		})
	},

	/**
	 * 用户点击跳转到 chicken 页面
	 */
	goToChicken: function () {
		wx.navigateTo({
			url: '/pages/chicken/chicken',
		})
	}
})