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
		value1: [0, 1],
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onChange1(e) {
			this.setData({ value1: e.detail.value });
		},
	}
})