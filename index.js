// pages/index/index.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		vw: 0,
		vh: 0, //画布视角
		score: 0, //成绩
		levelMap: ['#ffffff', '#88AEFF', '#A8FFBE', '#FFE57E', '#FFB57E', '#FF7E7E'],
		bigMap: true, //大地图
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},

	createMap() {

		var that = this
		//获取用户设备信息，屏幕宽度
		wx.createSelectorQuery().select('#share').boundingClientRect((res) => {
			// console.log(res);
			//设置画图信息
			var vw = res.width / 1200
			var vh = res.height / 1000
			this.setData({
				vw,
				vh,
			})
			var ctx = this.ctx
			if (!this.ctx) {
				this.ctx = wx.createCanvasContext('share')
				ctx = this.ctx
			}
			ctx.clearRect(0, 0, res.width, res.height);
			ctx.draw(true)
			ctx.setFillStyle("#fff")

			var pointList = []  // 输入你的点坐标集
			for (var i in pointList) {
				var tempA = pointList[i].path  // 点坐标路径
				var nowX = parseInt(tempA[1])
				var nowY = parseInt(tempA[2])
				var font = pointList[i].font // 点坐标文字未知
				// 绘制图
				ctx.moveTo(tempA[1] * vw, tempA[2] * vh)
				for (var j = 0; j < (tempA.length - 4) / 2; j++) {
					var type = j * 2 + 3
					var value = j * 2 + 4
					// console.log(nowX, nowY);
					// console.log(tempA[type], tempA[value]);
					switch (tempA[type]) {
						case 'V':
							nowY = parseInt(tempA[value])
							ctx.lineTo(nowX * vw, nowY * vh)
							break;
						case 'H':
							nowX = parseInt(tempA[value])
							ctx.lineTo(nowX * vw, nowY * vh)
							break;
						case 'h':
							nowX += parseInt(tempA[value])
							ctx.lineTo(nowX * vw, nowY * vh)
							break;
						case 'v':
							nowY += parseInt(tempA[value])
							ctx.lineTo(nowX * vw, nowY * vh)
							break;

						default:
							break;
					}
					// console.log(nowX, nowY);
				}
				ctx.setLineWidth(1)
				ctx.setFillStyle(this.data.levelMap[pointList[i].level])  // 不同等级填充不同颜色
				if (pointList[i].name != '南海诸岛' || pointList[i].level > 0) ctx.fill() //  南海诸岛不填充颜色，用于提示领土未标注完全
				ctx.lineCap = 'round'  // 绘制线类型
				ctx.stroke()
				ctx.restore()
				// 绘制文字
				ctx.font = "500 10px Arial";
				ctx.setFillStyle('black')
				ctx.fillText(pointList[i].name, font.x, font.y) // 绘制文字
				ctx.draw(true)
			}
		}).exec()
	},

	bigMap() {
		this.setData({
			bigMap: !this.data.bigMap
		})
		this.createMap()
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
		setTimeout(() => {
			var pointList = wx.getStorageSync('pointList')
			if (pointList) {
				this.setData({
					pointList: pointList,
					score: wx.getStorageSync('score'),
				})
			}
			this.createMap()
		}, 300);
	},

	// 单击地图元素
	tapShareCanvas(e) {
		// console.log(e);
		var {
			x,
			y
		} = e.detail
		this.whichProvince((x - e.currentTarget.offsetLeft) / this.data.vw, (y - e.currentTarget.offsetTop) / this.data.vh)
	},

	// 判断点击的哪个省份
	whichProvince(x, y) {
		var pointList = [] // 你的点坐标集
		for (var i in pointList) {
			var tempA = pointList[pointList.length - 1 - i]  //倒序查找
			var tempB = tempA.path
			var nowX = parseInt(tempB.x)
			var nowY = parseInt(tempB.y)
			var crossLine = 0
			for (var j = 0; j < (tempB.point.length - 4) / 2; j++) {
				var type = tempB[j * 2 + 3]
				var value = parseInt(tempB[j * 2 + 4])
				switch (type) {
					case 'V':
						if (nowX >= x && y >= Math.min(nowY, value) && y <= Math.max(nowY, value)) {
							crossLine++
							// console.log(nowY, value, y, nowX, x);
						}
						nowY = value
						break;
					case 'v':
						if (nowX >= x && y >= Math.min(nowY, nowY + value) && y <= Math.max(nowY, nowY + value)) {
							crossLine++
							// console.log(nowY, nowY + value, y, nowX, x);
						}
						nowY += value
						break;
					case 'H':
						nowX = value
						break;
					case 'h':
						nowX += value
						break;

					default:
						break;
				}
			}
			if (crossLine % 2 == 1) {
				console.log(tempA);
				var score = tempA.level + 1 > 5 ? this.data.score - 5 : this.data.score + 1
				pointList[tempA.index].level = tempA.level + 1 > 5 ? 0 : tempA.level + 1  // 点数溢出
				this.setData({
					pointList,
					score,
				})
				var nowTime = new Date().getTime()
				console.log(nowTime,this.lastTime);
				if (this.lastTime && nowTime - this.lastTime < 200) {
					console.log('连续点击')
				}
				this.lastTime = nowTime
				clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					this.createMap()
				}, 350);
				console.log(i, tempA)
				break
			}
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {
		wx.setStorageSync('pointList', this.data.pointList)  // 本地存储点等级
		wx.setStorageSync('score', this.data.score)  // 本地存储分数
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {
		wx.setStorageSync('pointList', this.data.pointList)
		wx.setStorageSync('score', this.data.score)
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

	}
})
