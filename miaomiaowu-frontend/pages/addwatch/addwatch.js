// pages/addwatch/addwatch.js
import { Toast } from 'tdesign-miniprogram'
import Message from 'tdesign-miniprogram/message/index'
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		fileList: [],
		nameinput: '',
		avatarUrl: '',
		darmaJianJie: '',
		madeCompany: '',
		platform: [],
		isUpdate: 0,
		totalNumber: 0,
		updateNumber: 0,
		watchNumber: 0,
		updateWeek: [],
		ratevalue: 0,
		remark: '',
		skylineRender: true,
		uploadImgPreview: '',
		isSelectImg: true,
		canClickImageBtn: true
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

	finishJianJieInput(e) {
		console.log(e.detail.value)
		this.data.darmaJianJie = e.detail.value
	},

	finishMadeInput(e) {
		console.log(e.detail.value)
		this.data.madeCompany = e.detail.value
	},

	handleStepperChange(e) {
		const { key } = e.currentTarget.dataset
		const { value } = e.detail
		this.setData({
			[key]: value
		})
		console.log(this.data.totalNumber, this.data.updateNumber, this.data.watchNumber)
	},

	/**
	 * 更改播放平台信息时触发
	 * @param {*} e 
	 */
	platformChange(e) {
		this.data.platform = this.findTrueIndices(e.detail)
		console.log(this.data.platform)
	},

	/**
	 * 更改更新时间时触发
	 * @param {*} e 
	 */
	checkChange(e) {
		console.log(e.detail)
		this.data.updateWeek = this.findTrueIndices(e.detail)
		console.log(this.data.updateWeek)
	},

	finishRemarkInput(e) {
		console.log(e.detail.value)
		this.data.remark = e.detail.value
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

	yesAdd() {
		const self = this
		if (this.data.nameinput != '' && this.data.avatarUrl != '' && this.data.darmaJianJie != '') {
			if (this.data.platform.length == 0) {
				this.data.platform = [4]
			}
			if (this.data.madeCompany == '') {
				this.data.madeCompany = '未知'
			}
			let dramaInfo = {
				drama_name: this.data.nameinput,
				cover_url: this.data.avatarUrl,
				introduction: this.data.darmaJianJie,
				made_company: this.data.madeCompany,
				playing_platform: this.data.platform,
				is_update: this.data.isUpdate,
				total_number: this.data.totalNumber,
				update_number: this.data.updateNumber,
				watch_number: this.data.watchNumber,
				update_time: this.data.updateWeek,
				love: this.data.ratevalue,
				remark: this.data.remark
			}
			const accessToken = wx.getStorageSync('accessToken')
			wx.request({
				url: `${app.globalData.baseUrl}/add_drama`,
				method: 'POST',
				data: {
					accessToken: accessToken,
					dramaInfo: dramaInfo
				},
				success(res) {
					console.log(res.data)
					if (res.data.success) {
						console.log('www')
						Toast({
							context: self,
							selector: '#t-toast',
							message: '添加成功',
						})
						wx.navigateTo({
							url: '/pages/watch/watch',
						})
					} else {
						Toast({
							context: self,
							selector: '#t-toast',
							message: '添加失败，请稍后再试',
						})
					}
				},
				fail(err) {
					console.error('请求失败！' + err.errMsg);
				}
			})
		} else {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先完善番剧信息',
			})
		}
	},

	/**
	 * 点击 + 上传图片
	 * @param {*} e 
	 */
	handleAdd(e) {
		const { fileList } = this.data
		const { files } = e.detail
		console.log(e.detail)
		// 方法1：选择完所有图片之后，统一上传，因此选择完就直接展示
		this.setData({
			fileList: [...fileList, ...files], // 此时设置了 fileList 之后才会展示选择的图片
		})
		if (fileList != []) {
			// console.log(6648)
			this.onUpload(files[0])
		}
		// files.forEach(file => this.uploadFile(file))
	},

	/**
	 * 图片上传方法
	 * @param {*} file 
	 */
	onUpload(file) {
		const { fileList } = this.data
		const self = this
		this.setData({
			fileList: [...fileList, { ...file, status: 'loading' }],
		})
		const { length } = fileList
		// console.log(9499)
		wx.uploadFile({
			url: 'https://pan-yz.chaoxing.com/upload/uploadfile?fldid=1045061952185040896&_token=99ad00c891d3e9e9bc9a613314ef9890&puid=198665227',
			filePath: file.url,
			name: 'file',
			formData: { user: 'test' },
			success: (res) => {
				this.setData({
					[`fileList[${length}].status`]: 'done',
					avatarUrl: JSON.parse(res.data).data.previewUrl
				})
				console.log(JSON.parse(res.data))
				Toast({
					context: self,
					selector: '#t-toast',
					message: '123',
				})
				if (JSON.parse(res.data).result) {
					Toast({
						context: self,
						selector: '#t-toast',
						message: '图片添加成功',
					})
				} else {
					Toast({
						context: self,
						selector: '#t-toast',
						message: '图片添加失败',
					})
					self.setData({
						fileList: []
					})
				}
				console.log(this.data.avatarUrl)
			},
			fail(err) {
				console.error('请求失败！' + err.errMsg)
				Toast({
					context: self,
					selector: '#t-toast',
					message: '图片上传失败\n' + err.errMsg,
				})
				self.setData({
					fileList: []
				})
			}
		})
	},

	/**
	 * 单击图片右上角 X 删除图片
	 * @param {*} e 
	 */
	handleRemove(e) {
		const { index } = e.detail;
		const { fileList } = this.data

		fileList.splice(index, 1)
		this.setData({
			fileList,
		})
		this.data.avatarUrl = ''
	},

	/**
	 * 更新类型信息修改
	 * @param {*} event 
	 */
	onTabsChange(event) {
		this.data.isUpdate = event.detail.value
		console.log(this.data.isUpdate)
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

	useDefaultImage() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			this.setData({
				canClickImageBtn: false
			})
			Message.info({
				context: this,
				offset: [12, 32],
				duration: 0,
				content: '默认图片生成中，请耐心等待',
			})
			const accessToken = wx.getStorageSync('accessToken')
			const self = this
			wx.request({
				url: `${app.globalData.baseUrl}/get_default_cover`,
				method: 'POST',
				data: {
					accessToken: accessToken,
					dramaName: dramaName
				},
				success(res) {
					console.log(res.data)
					if (res.data.coverUrl) {
						self.setData({
							isSelectImg: false,
							uploadImgPreview: res.data.coverUrl,
						})
					} else {
						self.setData({
							uploadImgPreview: '/images/cutedurk.png',
						})
					}
					Message.success({
						context: this,
						offset: [12, 32],
						duration: 3000,
						content: '图片生成成功',
					})
					self.setData({
						canClickImageBtn: true
					})
				},
				fail(error) {
					console.log(error.errMsg)
					self.setData({
						canClickImageBtn: true
					})
					Message.error({
						context: this,
						offset: [12, 32],
						duration: 3000,
						content: '图片生成失败',
					})
				}
			})
		}
	},

	getCoverFromOnline() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '敬请期待',
			})
		}
	},

	getCoverFromAI() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '此为VIP功能',
			})
		}
	},

	getJianJieFromOnline() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '敬请期待',
			})
		}
	},

	getJianJieFromAI() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '此为VIP功能',
			})
		}
	},



	delAddImage() {
		this.setData({
			isSelectImg: true,
			avatarUrl: ''
		})
	}	
})