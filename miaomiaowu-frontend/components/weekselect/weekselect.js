// components/weekselect/weekselect.js
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
		checked: [false, false, false, false, false, false, false]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		checkWeek(e) {
			const index = e.currentTarget.dataset.index
			const checktemp = `checked[${index}]`
			this.setData({
				[checktemp]: e.detail.checked
			})
			this.triggerEvent('checkChange', this.data.checked)
			// console.log(this.data.checked)
		},

		/**
		 * 通过值修改星期选择选项状态
		 * @param {boolean[7]} value - 星期选择
		 */
		valueChangeWeekSelect(value) {
			if (Array.isArray(value) && value.length === 7 && value.every(item => typeof item === 'boolean')) {
				this.setData({
					// 浅拷贝
					checked: [...value]
				})
			} else {
				console.error('Value must be an array of 7 booleans')
			}
		}
	}
})