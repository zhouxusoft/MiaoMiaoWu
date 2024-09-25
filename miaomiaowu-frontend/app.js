// app.js
App({
	onLaunch() {
		// 展示本地存储能力
		const logs = wx.getStorageSync('logs') || []
		logs.unshift(Date.now())
		wx.setStorageSync('logs', logs)

		// 登录
		wx.login({
			success: res => {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
			}
		})
	},
	globalData: {
		// baseUrl: 'http://192.168.116.43:5000',
		baseUrl: 'http://192.168.1.3:5000',
	}
})

// wx.request({
//   url: 'https://www.baidu.com',
//   enableChunked: true
// }).onChunkReceived(chunk => {
// 	console.log(new TextDecoder().decode(chunk.data))
// })