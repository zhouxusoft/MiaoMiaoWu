// components/watchitem/watchitem.js
Component({

	/**
	 * 组件的属性列表
	 */
	properties: {
		dramaInfo: {
			type: Array,
			value: []
		},
		watchid: {
			type: Number,
			value: 1
		},
		watchitemname: {
			type: String,
			value: '斗破苍穹年番'
		},
		watchitemmade: {
			type: String,
			value: '幻维数码'
		},
		watchwatchmode: {
			type: String,
			value: '连载中'
		},
		watchupdateto: {
			type: Number,
			value: '110'
		},
		watchwatchto: {
			type: Number,
			value: '102'
		},
		watchsummary: {
			type: String,
			value: '三年之约后，萧炎终于在迦南学院见到了薰儿，此后他广交挚友并成立磐门；为继续提升实力以三上云岚宗为父复仇，他以身犯险深入天焚炼气塔吞噬陨落心炎'
		},
		userlove: {
			type: Number,
			value: 4
		},
		watchcover: {
			type: String,
			value: '/images/dp.jpg'
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		gowatchitem: function () {
			wx.navigateTo({
			  url: '/pages/watchitem/watchitem?dramaInfo=' + this.properties.dramaInfo,
			})
		}
	}
})