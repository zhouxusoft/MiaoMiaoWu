// pages/watchitem/watchitem.js
import { Toast } from 'tdesign-miniprogram'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		updateMode: '连载中',
		updateModes: [
			{ label: '连载中', value: '连载中' },
			{ label: '已完结', value: '已完结' },
			{ label: '未更新', value: '未更新' }
		],
		madeInputValue: '幻维数码',
		yesMadeInputValue: '幻维数码'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		let watchid = options.watchid
		console.log(watchid)

		wx.setNavigationBarTitle({
			title: '斗破苍穹年番'
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

	/**
	 * 点击弹出更新状态选择器
	 */
	onUpdateModePicker() {
		this.setData({ updateModeVisible: true })
	},

	/**
	 * 确认更新更新状态
	 * @param {*} e 
	 */
	onPickerChange(e) {
		const { value } = e.detail
		console.log('picker change:', e.detail)
		this.setData({
			updateModeVisible: false,
			updateMode: value,
		})
	},

	/**
	 * 取消更新更新状态
	 * @param {*} e 
	 */
	onPickerCancel(e) {
		console.log(e, '取消')
		this.setData({
			updateModeVisible: false,
		})
	},

	/**
	 * 点击弹出制作公司修改
	 */
	onMadeInput() {
		console.log(this.data.madeInputValue)
		this.setData({
			madeInputValue: this.data.madeInputValue,
			madeInputVisible: true
		})
	},

	/**
	 * 制作公司修改弹出层弹出状态变化时，修改 madeInputVisible 值
	 * @param {*} e 
	 */
	onMadeInputVisibleChange(e) {
		this.setData({
			madeInputVisible: e.detail.visible,
		})
	},

	/**
	 * 点击关闭制作公司弹出层
	 */
	closeMadeInput() {
		this.setData({
			madeInputVisible: false
		})
	},

	/**
	 * 点击确认修改制作公司
	 */
	yesMadeInput() {
		this.setData({
			madeInputValue: this.data.yesMadeInputValue,
			madeInputVisible: false
		})
	},

	/**
	 * 修改制作公司名称
	 */
	changeMadeInput(e) {
		this.data.yesMadeInputValue = e.detail.value
		if (this.isStringTooLong(e.detail.value, 30)) {
			this.showMaxText()
		}
	},

	/**
	 * 公司名称长度超限提示
	 */
	showMaxText() {
		Toast({
			context: this,
			selector: '#t-toast',
			message: '名称长度限制为30字符，中文占2字符',
		});
	},


	/**
	 * 判断字符长度是否超限
	 * @param {String} str - 用于判断的字符串
	 * @param {Number} maxlength - 字符的最大限制
	 */
	isStringTooLong(str, maxlength = 30) {
		let length = 0
		for (let i = 0; i < str.length; i++) {
			const charCode = str.charCodeAt(i)
			// 判断是否是中文字符
			if (charCode >= 0x4e00 && charCode <= 0x9fff) {
				length += 2 // 中文字符算2个字符
			} else {
				length += 1 // 其他字符算1个字符
			}

			// 提前终止循环以提高性能
			if (length >= maxlength) {
				return true
			}
		}
		// console.log(length)
		return length >= maxlength
	}
})