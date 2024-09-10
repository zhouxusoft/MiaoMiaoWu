// pages/watch/watch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabPanelstyle: 'display:flex;justify-content:center;align-items:center;',
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

	onTabsChange(event) {
		console.log(`Change tab, tab-panel value is ${event.detail.value}.`);
	},

	onTabsClick(event) {
		console.log(`Click tab, tab-panel value is ${event.detail.value}.`);
	},

	onChange(e) {
		console.log(e.detail.value);
	},

	properties: {
		navbarHeight: {
			type: Number,
			value: 0,
		},
	},
})