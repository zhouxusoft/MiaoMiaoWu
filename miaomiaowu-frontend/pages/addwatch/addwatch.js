// pages/addwatch/addwatch.js
import { Toast } from 'tdesign-miniprogram'
import Message from 'tdesign-miniprogram/message/index'
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		fileList: [], // 文件列表，用于封面上传
		nameinput: '', // 番剧名称
		avatarUrl: '', // 封面的url
		darmaJianJie: '',	// 番剧简介
		madeCompany: '',	// 制作公司
		platform: [], // 播放平台
		isUpdate: 0, // 更新状态 0 连载中 1 已完结  2 未更新
		totalNumber: 0, // 总集数
		updateNumber: 0, // 更新到
		watchNumber: 0, // 观看到
		updateWeek: [], // 更新时间 ，[2,6]每周三周日更新
		ratevalue: 0, // 评分
		remark: '',	// 备注
		skylineRender: true, // TDesign 组件数据
		uploadImgPreview: '', // 默认封面，网络获取封面、ai生成封面显示的url
		isSelectImg: true, // 手动上传图像
		canClickImageBtn: true, // 按钮是否允许被点击，用于防抖
		dramaInfoOnline: {} // 网络获取到的番剧信息
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
	 * 完成简介的输入
	 * @param {*}} e 
	 */
	finishJianJieInput(e) {
		console.log(e.detail.value)
		this.data.darmaJianJie = e.detail.value
	},

	/**
	 * 完成制作公司输入
	 * @param {*} e 
	 */
	finishMadeInput(e) {
		console.log(e.detail.value)
		this.data.madeCompany = e.detail.value
	},

	/**
	 * 点击更改集数
	 * @param {*}} e 
	 */
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

	/**
	 * 完成备注输入时触发
	 * @param {*} e 
	 */
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

	/**
	 * 点击确认添加番剧
	 */
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

	/**
	 * 点击使用默认封面，将番剧名称传给后端
	 */
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
					self.setData({
						avatarUrl: self.data.uploadImgPreview,
					})
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

	/**
	 * 点击从网络获取封面
	 */
	getCoverFromOnline() {
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			if (this.data.dramaInfoOnline.title == dramaName) {
				this.setData({
					avatarUrl: this.data.dramaInfoOnline.cover
				})
			} else {
				this.setData({
					canClickImageBtn: false
				})
				Message.info({
					context: this,
					offset: [12, 32],
					duration: 0,
					content: '正在从网络获取内容...',
				})
				const accessToken = wx.getStorageSync('accessToken')
				const self = this
				wx.request({
					url: `${app.globalData.baseUrl}/get_drama_info_online`,
					method: 'POST',
					data: {
						accessToken: accessToken,
						dramaName: dramaName
					},
					success(res) {
						self.setData({
							canClickImageBtn: true
						})
						console.log(res.data)
						if (res.data.success) {
							Message.success({
								context: this,
								offset: [12, 32],
								duration: 3000,
								content: '从网络获取内容成功',
							})
							let infoTemp = res.data.dramaInfo
							self.data.dramaInfoOnline = infoTemp
							self.setData({
								uploadImgPreview: infoTemp.cover,
								avatarUrl: infoTemp.cover,
								isSelectImg: false
							})
						} else {
							Message.error({
								context: this,
								offset: [12, 32],
								duration: 3000,
								content: '未找到结果，请确认番剧名称',
							})
						}
					},
					fail(error) {
						Message.error({
							context: this,
							offset: [12, 32],
							duration: 3000,
							content: '请求失败，请稍后再试',
						})
						self.setData({
							canClickImageBtn: true
						})
						console.log(error.errMsg)
					}
				})
			}
		}
	},

	/**
	 * 点击 AI 生成封面
	 */
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
				message: '此为 VIP 功能\n请充值后使用',
			})
		}
	},

	/**
	 * 点击从网络获取简介
	 */
	getJianJieFromOnline() {
		console.log('网络获取')
		let dramaName = this.data.nameinput
		if (dramaName == '') {
			Toast({
				context: this,
				selector: '#t-toast',
				message: '请先输入番剧名称',
			})
		} else {
			if (this.data.dramaInfoOnline.title == dramaName) {
				this.setData({
					darmaJianJie: this.data.dramaInfoOnline.jian_jie,
					madeCompany: this.data.dramaInfoOnline.made_company,
					totalNumber: this.data.dramaInfoOnline.update,
					updateNumber: this.data.dramaInfoOnline.update,
				})
			} else {
				this.setData({
					canClickImageBtn: false
				})
				Message.info({
					context: this,
					offset: [12, 32],
					duration: 0,
					content: '正在从网络获取内容...',
				})
				const accessToken = wx.getStorageSync('accessToken')
				const self = this
				wx.request({
					url: `${app.globalData.baseUrl}/get_drama_info_online`,
					method: 'POST',
					data: {
						accessToken: accessToken,
						dramaName: dramaName
					},
					success(res) {
						self.setData({
							canClickImageBtn: true
						})
						console.log(res.data)
						if (res.data.success) {
							Message.success({
								context: this,
								offset: [12, 32],
								duration: 3000,
								content: '从网络获取内容成功',
							})
							let infoTemp = res.data.dramaInfo
							self.data.dramaInfoOnline = infoTemp
							self.setData({
								darmaJianJie: infoTemp.jian_jie,
								madeCompany: infoTemp.made_company,
								totalNumber: infoTemp.update,
								updateNumber: infoTemp.update,
							})
						} else {
							Message.error({
								context: this,
								offset: [12, 32],
								duration: 3000,
								content: '未找到结果，请确认番剧名称',
							})
						}
					},
					fail(error) {
						Message.error({
							context: this,
							offset: [12, 32],
							duration: 3000,
							content: '请求失败，请稍后再试',
						})
						self.setData({
							canClickImageBtn: true
						})
						console.log(error.errMsg)
					}
				})
			}
		}
	},

	/**
	 * 向 AI 获取简介
	 */
	getJianJieFromAI() {
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
				content: '简介内容生成中，请耐心等待',
			})
			const accessToken = wx.getStorageSync('accessToken')
			const self = this
			wx.request({
				url: `${app.globalData.baseUrl}/auto_jian_jie`,
				method: 'POST',
				data: {
					accessToken: accessToken,
					dramaName: dramaName
				},
				success(res) {
					self.setData({
						canClickImageBtn: true
					})
					console.log(res.data)
					if (res.data.success) {
						Message.info({
							context: this,
							offset: [12, 32],
							duration: 0,
							content: '正在输出简介内容',
						})
						self.outputJianJie(res.data.jianjie)
					}
				},
				fail(error) {
					self.setData({
						canClickImageBtn: true
					})
					console.log(error.errMsg)
				}
			})
		}
	},

	/**
	 * 逐字输出简介
	 * @param {String}} jianjie - 简介内容
	 */
	outputJianJie(jianjie) {
		this.setData({
			darmaJianJie: ''
		})
		while (jianjie.length > 100) {
			let lastPeriodIndex = jianjie.lastIndexOf('。', 100)
			if (lastPeriodIndex !== -1) {
				jianjie = jianjie.substring(0, lastPeriodIndex + 1)
			} else {
				jianjie = jianjie.substring(0, 100)
				break
			}
		}
		let jianjieTemp = ''
		for (let i = 0; i < jianjie.length; i++) {
			((index) => {
				setTimeout(() => {
					jianjieTemp += jianjie[index]
					this.setData({
						darmaJianJie: jianjieTemp
					})

					if (index === jianjie.length - 1) {
						Message.success({
							context: this,
							offset: [12, 32],
							duration: 3000,
							content: '内容生成完成',
						})
					}
				}, index * 50)
			})(i)
		}
	},

	/**
	 * 删除按钮触发，用于删除生成的图片
	 */
	delAddImage() {
		this.setData({
			isSelectImg: true,
			avatarUrl: ''
		})
	},

	/**
	 * 图片预览
	 */
	previewImage() {
		wx.previewImage({
			current: this.data.avatarUrl, // 当前显示图片的http链接
			urls: [this.data.avatarUrl] // 需要预览的图片http链接列表
		})
	}
})