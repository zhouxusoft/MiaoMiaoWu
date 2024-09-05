Page({
	data: {
		loading: true
	},
	onLoad() {
		// 模拟加载过程
		setTimeout(() => {
			this.setData({
				loading: false
			});
		}, 3000); // 3秒后隐藏加载动画
	}
});