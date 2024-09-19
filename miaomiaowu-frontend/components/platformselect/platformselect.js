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
			this.data.checked[0] = e.detail.checked
			console.log(this.data.checked)
		},

		selectBilibili(e) {
			this.data.checked[1] = e.detail.checked
			console.log(this.data.checked)
		},

		selectIqiyi(e) {
			this.data.checked[2] = e.detail.checked
			console.log(this.data.checked)
		},

		selectYouku(e) {
			this.data.checked[3] = e.detail.checked
			console.log(this.data.checked)
		},

		selectOther(e) {
			this.data.checked[4] = e.detail.checked
			console.log(this.data.checked)
		}
	}
})