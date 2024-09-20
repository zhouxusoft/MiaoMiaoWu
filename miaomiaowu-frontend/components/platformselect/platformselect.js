// components/platformselect/platformselect.js
Component({

	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		checked: [false, false, false, false, false]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		selectTencent(e) {
			const updatedProperty = `checked[0]`
			this.setData({
				[updatedProperty]: e.detail.checked
			})
			console.log(this.data.checked)
		},

		selectBilibili(e) {
			const updatedProperty = `checked[1]`
			this.setData({
				[updatedProperty]: e.detail.checked
			})
			console.log(this.data.checked)
		},

		selectIqiyi(e) {
			const updatedProperty = `checked[2]`
			this.setData({
				[updatedProperty]: e.detail.checked
			})
			console.log(this.data.checked)
		},

		selectYouku(e) {
			const updatedProperty = `checked[3]`
			this.setData({
				[updatedProperty]: e.detail.checked
			})
			console.log(this.data.checked)
		},

		selectOther(e) {
			const updatedProperty = `checked[4]`
			this.setData({
				[updatedProperty]: e.detail.checked
			})
			console.log(this.data.checked)
		},

		/**
		 * 通过值修改选中状态
		 * @param {boolean[5]} value 
		 */
		valueChangePlatform(value) {
			if (Array.isArray(value) && value.length === 5 && value.every(item => typeof item === 'boolean')) {
				this.setData({
					checked: value
				})
			} else {
				console.error('Invalid input: value must be an array of five booleans')
			}
		},
	}
})