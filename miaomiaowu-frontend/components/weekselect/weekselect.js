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
		checkWeekMon(e) {
			this.data.checked[0] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekTue(e) {
			this.data.checked[1] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekWed(e) {
			this.data.checked[2] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekThu(e) {
			this.data.checked[3] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekFir(e) {
			this.data.checked[4] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekSat(e) {
			this.data.checked[5] = e.detail.checked
			console.log(this.data.checked)
		},
		checkWeekSun(e) {
			this.data.checked[6] = e.detail.checked
			console.log(this.data.checked)
		}
	}
})