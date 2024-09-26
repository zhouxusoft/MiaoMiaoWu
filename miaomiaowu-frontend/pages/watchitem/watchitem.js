// pages/watchitem/watchitem.js
import { Toast } from 'tdesign-miniprogram'
import Message from 'tdesign-miniprogram/message/index'
const app = getApp()

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		dramaId: 0,
		dramaName: '番剧名称',
		darmaCover: '/images/noise.png',
		dramaJianJie: '番剧简介',
		updateMode: '播放状态',
		updateModeTemp: '播放状态',
		updateModes: [
			{ label: '连载中', value: '连载中' },
			{ label: '已完结', value: '已完结' },
			{ label: '未更新', value: '未更新' }
		],
		madeInputValue: '制作公司',
		yesMadeInputValue: '制作公司',
		platformValueText: ['播放平台'],
		platformValue: [false, false, false, false, false],
		platformValueTemp: [false, false, false, false, false],
		platformList: ['腾讯视频', '哔哩哔哩', '爱奇艺', '优酷视频', '其它'],
		updateToNum: 0,
		updateToNumTemp: 0,
		watchToNum: 0,
		watchToNumTemp: 0,
		updateHaveChanged: false,
		watchHaveChanged: false,
		weekSelectValue: [false, false, false, false, false, false, false],
		weekSelectValueTemp: [false, false, false, false, false, false, false],
		isWeekSelectChange: false,
		rateValue: 0,
		ratevalueTemp: 0,
		userText: '备注',
		userTextTemp: '备注',
		isRateChange: false,
		isUserTextChange: false,
		isRateandUserTextChange: false,
		isUpdateHappen: false,
		dialogKey: '',
		showConfirm: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		let dramaInfo = options.dramaInfo
		console.log(dramaInfo)

		// const dataArray = dramaInfo.split(",")
		// console.log(dataArray)

		const parsedArray = this.parseNestedArrays(dramaInfo)
		console.log(parsedArray)
		this.setDramaInfo(parsedArray)
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
		console.log('picker change:', value[0])
		if (value[0] != this.data.updateMode) {
			console.log('changed')
			this.setData({
				updateMode: value[0]
			})
			this.updateDramaInfo()
		}
		this.setData({
			updateModeVisible: false
		})
		const weekselect = this.selectComponent('#weekselect')
		if (weekselect) {
			weekselect.valueChangeWeekSelect(this.data.weekSelectValue)
		}
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
		console.log(this.data.madeInputValue, this.data.yesMadeInputValue)
		if (this.data.madeInputValue != this.data.yesMadeInputValue) {
			this.setData({
				madeInputValue: this.data.yesMadeInputValue,
				madeInputVisible: false
			})
			this.updateDramaInfo()
		} else {
			this.setData({
				madeInputVisible: false
			})
		}
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
		if (!this.arraysEqual(this.data.platformValue, this.data.platformValueTemp)) {
			this.updateDramaInfo()
		}
		this.setData({
			platformVisible: false
		})
	},

	/**
	 * 更改播放平台信息时触发
	 * @param {*} e 
	 */
	platformChange(e) {
		this.data.platformValue = e.detail
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
	},

	/**
	 * 更改更新时间时触发
	 * @param {*} e 
	 */
	checkChange(e) {
		// console.log(e.detail)
		this.data.weekSelectValue = e.detail
		if (JSON.stringify(this.data.weekSelectValueTemp) != JSON.stringify(this.data.weekSelectValue)) {
			this.setData({
				isWeekSelectChange: true
			})
		} else {
			this.setData({
				isWeekSelectChange: false
			})
		}
	},

	/**
	 * 用户改变评分
	 * @param {*} e 
	 */
	onRateChange(e) {
		const { value } = e.detail
		this.setData({
			rateValue: value
		})
		console.log(this.data.rateValue)
		if (this.data.rateValue != this.data.ratevalueTemp) {
			this.data.isRateChange = true
		} else {
			this.data.isRateChange = false
		}
		this.rateAndUserTextChange()
	},

	/**
	 * 用户改变备注
	 * @param {*} e 
	 */
	onUserTextChange(e) {
		const { value } = e.detail
		this.data.userText = value
		console.log(this.data.userText)
		console.log(this.data.userTextTemp)
		if (this.data.userText != this.data.userTextTemp) {
			this.data.isUserTextChange = true
		} else {
			this.data.isUserTextChange = false
		}
		this.rateAndUserTextChange()
	},

	/**
	 * 改变评分或者备注中的任何一个，显示确认修改按钮
	 */
	rateAndUserTextChange() {
		if (this.data.isUserTextChange || this.data.isRateChange) {
			this.setData({
				isRateandUserTextChange: true
			})
		} else {
			this.setData({
				isRateandUserTextChange: false
			})
		}
	},

	/**
	 * 将字符串转为数组
	 * @param {String} data 
	 */
	parseNestedArrays(data) {
		if (typeof data === 'string') {
			data = data.split(/,(?=\S)/)  // 使用正则表达式来分割字符串
		}

		const result = []
		const nestedArrayPattern = /^\[(.*?)\]$/

		for (let i = 0; i < data.length; i++) {
			let item = data[i].trim()
			let match = nestedArrayPattern.exec(item)

			if (match) {
				// 处理嵌套数组
				let nestedArray = match[1].split(',').map(num => num.trim()).map(num => isNaN(Number(num)) ? num : Number(num))
				result.push(nestedArray)
			} else if (item.startsWith('[')) {
				let nestedArray = []
				while (!item.endsWith(']')) {
					nestedArray.push(...item.substring(1).split(',').map(num => num.trim()).map(num => isNaN(Number(num)) ? num : Number(num)))
					i++
					item = data[i].trim()
				}
				nestedArray.push(...item.substring(0, item.length - 1).split(',').map(num => num.trim()).map(num => isNaN(Number(num)) ? num : Number(num)))
				result.push(nestedArray);
			} else {
				result.push(isNaN(Number(item)) ? item : Number(item))
			}
		}

		return result
	},

	/**
	 * 例：将数组 [2, 6] 转换为布尔值数组 [false, false, true, false, false, false, true]
	 * @param {Array} indices 
	 * @param {Number} length - 布尔值数组长度
	 */
	convertToBooleanArray(indices, length) {
		// 初始化一个长度为 length 的全为 false 的数组
		const resultArray = new Array(length).fill(false)

		// 遍历索引数组，将对应位置设为 true
		indices.forEach(index => {
			if (index < length) {
				resultArray[index] = true
			}
		})

		return resultArray
	},

	/**
	 * 提交番剧信息修改
	 */
	updateDramaInfo() {
		this.setData({
			isUpdateHappen: true
		})
		const self = this
		const accessToken = wx.getStorageSync('accessToken')
		let dramaInfo = {
			id: this.data.dramaId,
			drama_name: this.data.dramaName,
			cover_url: this.data.darmaCover,
			introduction: this.data.dramaJianJie,
			made_company: this.data.madeInputValue,
			playing_platform: this.findTrueIndices(this.data.platformValue),
			is_update: this.changeUpdateModesToNum(this.data.updateMode),
			total_number: this.data.updateToNum,
			update_number: this.data.updateToNum,
			watch_number: this.data.watchToNum,
			update_time: this.findTrueIndices(this.data.weekSelectValue),
			love: this.data.rateValue,
			remark: this.data.userText
		}
		let dramaInfoTemp = [
			dramaInfo.id,
			0,
			dramaInfo.drama_name,
			dramaInfo.cover_url,
			dramaInfo.introduction,
			dramaInfo.made_company,
			dramaInfo.playing_platform,
			this.data.updateMode,
			dramaInfo.total_number,
			dramaInfo.update_number,
			dramaInfo.watch_number,
			0,
			dramaInfo.update_time,
			dramaInfo.love,
			dramaInfo.remark,
		]
		console.log(dramaInfoTemp)
		console.log(dramaInfo)
		wx.request({
			url: `${app.globalData.baseUrl}/update_drama`,
			method: 'POST',
			data: {
				accessToken: accessToken,
				dramaInfo: dramaInfo
			},
			success(res) {
				console.log(res.data)
				self.setDramaInfo(dramaInfoTemp)
				Message.success({
					context: this,
					offset: [12, 32],
					duration: 3000,
					single: false,
					content: '数据更新成功！',
				})
				self.setData({
					isUpdateHappen: false
				})
			},
			fail(error) {
				console.log(error.errMsg)
				self.setData({
					isUpdateHappen: false
				})
			}
		})
	},

	setDramaInfo(dramaInfo) {
		this.setData({
			dramaName: dramaInfo[2],
			darmaCover: dramaInfo[3],
			dramaJianJie: dramaInfo[4],
			madeInputValue: dramaInfo[5],
			updateMode: dramaInfo[7],
			platformValue: this.convertToBooleanArray(dramaInfo[6], 5),
			updateToNum: dramaInfo[9],
			watchToNum: dramaInfo[10],
			weekSelectValue: this.convertToBooleanArray(dramaInfo[12], 7),
			rateValue: dramaInfo[13],
			userText: dramaInfo[14],
			updateHaveChanged: false,
			watchHaveChanged: false,
			isWeekSelectChange: false,
			isRateChange: false,
			isUserTextChange: false,
			isRateandUserTextChange: false
		})

		this.data.dramaId = dramaInfo[0]
		this.data.updateModeTemp = dramaInfo[7]
		this.data.platformValue = this.convertToBooleanArray(dramaInfo[6], 5)
		this.data.platformValueTemp = this.convertToBooleanArray(dramaInfo[6], 5)
		this.data.updateToNumTemp = dramaInfo[9]
		this.data.watchToNumTemp = dramaInfo[10]
		this.data.weekSelectValueTemp = this.convertToBooleanArray(dramaInfo[12], 7)
		this.data.rateValueTemp = dramaInfo[13]
		this.data.userTextTemp = dramaInfo[14]
		this.data.yesMadeInputValue = dramaInfo[5]

		this.updatePlatformValueText(this.data.platformValue)

		wx.setNavigationBarTitle({
			title: dramaInfo[2]
		})
		const weekselect = this.selectComponent('#weekselect')
		if (weekselect) {
			weekselect.valueChangeWeekSelect(this.data.weekSelectValue)
		}
	},

	/**
	 * 将 [true, false, false, false, true] 转为 [0,4]
	 * @param {Array} arr 
	 */
	findTrueIndices(arr) {
		const indices = []
		arr.forEach((item, index) => {
			if (item === true) {
				indices.push(index)
			}
		});
		return indices
	},

	/**
	 * 判断数组值是否相等
	 * @param {Array} arr1 
	 * @param {Array} arr2 
	 */
	arraysEqual(arr1, arr2) {
		if (arr1.length !== arr2.length) {
			return false
		}
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				return false
			}
		}
		return true
	},

	/**
	 * 将番剧的更新情况从文字转为数据库存的0、1、2
	 * @param {String} updateMode 
	 */
	changeUpdateModesToNum(updateMode) {
		let isUpdate = 2
		if (updateMode == '连载中') {
			isUpdate = 0
		} else if (updateMode == '已完结') {
			isUpdate = 1
		} else {
			isUpdate = 2
		}
		return isUpdate
	},

	showDialog(e) {
		const { key } = e.currentTarget.dataset;
		this.setData({ [key]: true, dialogKey: key });
	},

	closeDialog() {
		const { dialogKey } = this.data
		this.setData({ [dialogKey]: false })
	},

	yesDialog() {
		const { dialogKey } = this.data
		this.setData({ [dialogKey]: false })
		const self = this
		const accessToken = wx.getStorageSync('accessToken')
		wx.request({
			url: `${app.globalData.baseUrl}/delete_drama`,
			method: 'POST',
			data: {
				accessToken: accessToken,
				dramaId: self.data.dramaId
			},
			success(res) {
				// console.log(res.data)
				if (res.data.success) {
					wx.redirectTo({
					  url: '/pages/watch/watch',
					})
				}
			},
			fail(error) {
				console.log(error.errMsg)
			}
		})
	},
})