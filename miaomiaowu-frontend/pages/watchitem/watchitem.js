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
		yesMadeInputValue: '幻维数码',
		platformValueText: ['腾讯视频'],
		platformValue: [true, false, false, false, false],
		platformList: ['腾讯视频', '哔哩哔哩', '爱奇艺', '优酷视频', '其它'],
		updateToNum: 110,
		updateToNumTemp: 110,
		watchToNum: 102,
		watchToNumTemp: 102,
		updateHaveChanged: false,
		watchHaveChanged: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		let watchid = options.watchid
		// console.log(watchid)

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
	 * Toast
	 * 公司名称长度超限提示
	 */
	showMaxText() {
		Toast({
			context: this,
			selector: '#t-toast',
			message: '名称长度限制为30字符，中文占2字符',
		})
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
	},

	/**
	 * 显示播放平台弹出窗口
	 */
	onPlatform() {
		// 获取 platformselect 组件实例
		const platformselect = this.selectComponent('#platformselect')
		if (platformselect) {
			// 调用 platformselect 组件方法,设置显示状态
			platformselect.valueChangePlatform(this.data.platformValue)
		}
		this.setData({
			platformVisible: true
		})
	},

	/**
	 * 改变播放平台弹出窗口的显示状态，点击遮罩层关闭窗口
	 * @param {*} e 
	 */
	onPlatformVisibleChange(e) {
		this.setData({
			platformVisible: e.detail.visible,
		})
	},

	/**
	 * 取消修改播放平台信息
	 */
	closePlatform() {
		this.setData({
			platformVisible: false
		})
	},

	/**
	 * 确认修改播放平台信息
	 */
	yesPlatform() {
		// 更新播放平台显示
		this.updatePlatformValueText(this.data.platformValue)
		this.setData({
			platformVisible: false
		})
	},

	/**
	 * 根据数据更新显示平台
	 * @param {boolean[5]} platformValue - 是否在对应平台播放
	 */
	updatePlatformValueText(platformValue) {
		// 暂时存储播放平台列表信息
		let platformValueTemp = []
		// 更新暂存列表
		for (let i = 0; i < platformValue.length; i++) {
			if (platformValue[i]) {
				platformValueTemp.push(this.data.platformList[i])
			}
		}
		// 更新播放平台信息
		this.setData({
			platformValueText: platformValueTemp
		})
	},

	/**
	 * 修改更新集数
	 * @param {*} e 
	 */
	changeUpdateToNum(e) {
		this.setData({
			updateToNum: e.detail.value
		})
		// 判断更新集数是否有过更改
		if (this.data.updateToNum != this.data.updateToNumTemp) {
			this.setData({
				updateHaveChanged: true
			})
		} else {
			this.setData({
				updateHaveChanged: false
			})
		}
		// console.log(this.data.updateToNum)
		// 判断合理性
		if (this.data.updateToNum < this.data.watchToNum) {
			this.warnWatchandUpdate()
		}
	},

	/**
	 * 修改观看集数
	 * @param {*} e 
	 */
	changeWatchToNum(e) {
		this.setData({
			watchToNum: e.detail.value
		})
		// 判断观看集数是否有过更改
		if (this.data.watchToNum != this.data.watchToNumTemp) {
			this.setData({
				watchHaveChanged: true
			})
		} else {
			this.setData({
				watchHaveChanged: false
			})
		}
		// console.log(this.data.watchToNum)
		// 判断集数合理性
		if (this.data.updateToNum < this.data.watchToNum) {
			this.warnWatchandUpdate()
		}
	},

	/**
	 * Toast
	 * 观看集数大于更新集数时提示不合理
	 */
	warnWatchandUpdate() {
		Toast({
			context: this,
			selector: '#t-toast',
			message: '这合理吗',
		})
	}
})