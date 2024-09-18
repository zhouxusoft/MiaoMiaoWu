// pages/addwatch/addwatch.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		fileList: [],
		nameinput: '',
		skylineRender: true,
		ratevalue: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

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
	 * 完成番剧名称输入
	 * @param {*} e 
	 */
	finishNameInput(e) {
		console.log(e.detail.value)
		this.data.nameinput = e.detail.value

	},

	/**
	 * 点击 + 上传图片
	 * @param {*} e 
	 */
	handleAdd(e) {
		const { fileList } = this.data;
		const { files } = e.detail;

		// 方法1：选择完所有图片之后，统一上传，因此选择完就直接展示
		this.setData({
			fileList: [...fileList, ...files], // 此时设置了 fileList 之后才会展示选择的图片
		});

		// 方法2：每次选择图片都上传，展示每次上传图片的进度
		// files.forEach(file => this.uploadFile(file))
	},

	/**
	 * 图片上传方法
	 * @param {*} file 
	 */
	onUpload(file) {
		const { fileList } = this.data;

		this.setData({
			fileList: [...fileList, { ...file, status: 'loading' }],
		});
		const { length } = fileList;

		const task = wx.uploadFile({
			url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
			filePath: file.url,
			name: 'file',
			formData: { user: 'test' },
			success: () => {
				this.setData({
					[`fileList[${length}].status`]: 'done',
				});
			},
		});
		task.onProgressUpdate((res) => {
			this.setData({
				[`fileList[${length}].percent`]: res.progress,
			});
		});
	},

	/**
	 * 单击图片右上角 X 删除图片
	 * @param {*} e 
	 */
	handleRemove(e) {
		const { index } = e.detail;
		const { fileList } = this.data;

		fileList.splice(index, 1);
		this.setData({
			fileList,
		});
	},

	/**
	 * 更新类型信息修改
	 * @param {*} event 
	 */
	onTabsChange(event) {
		console.log(`Change tab, tab-panel value is ${event.detail.value}.`)
	},

	/**
	 * 用户改变评分
	 * @param {*} e 
	 */
	onRateChange(e) {
		const { value } = e.detail
		this.setData({
			ratevalue: value
		})
		console.log(this.data.ratevalue)
	},
})