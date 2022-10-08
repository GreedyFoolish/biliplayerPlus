// ==UserScript==
// @name         bilibili 播放器增强
// @namespace    https://github.com/Grow-Willing/biliplayerPlus
// @version      2022.10.8
// @description  快捷键设置,回车快速发弹幕,双击全屏,自动选择最高清画质、播放、全屏、关闭弹幕、自动转跳和自动关灯等
// @author       sugar
// @license      MIT
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/video/BV*
// @match        *://www.bilibili.com/s/video/BV*
// @match        *://www.bilibili.com/video/bv*
// @match        *://www.bilibili.com/watchlater/*
// @match        *://www.bilibili.com/medialist/*
// @require      https://cdn.bootcdn.net/ajax/libs/bignumber.js/9.1.0/bignumber.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-cookie/3.0.1/js.cookie.js
// @resource     MaterialIcons https://fonts.googleapis.com/icon?family=Material+Icons
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_getResourceText
// ==/UserScript==
(function () {
	let data={
		settingName: 'bilibili播放器plus设置',//设置面板标题
		elementMapper:[{//不同页面元素映射至一致
				filter:/(video\/[AaBb][Vv])|(watchlater)|(medialist)/,//正则
				settingRootElement:`[aria-label="哔哩哔哩播放器"]`,//设置面板的挂载节点
				showElement:`[aria-label="哔哩哔哩播放器"]`,//全屏时的最大元素
				videoTag:"#bilibili-player video",//video标签
				videoTag_replace:"#bilibili-player bwp-video",//video标签
				settingIcon:".bpx-player-ctrl-setting .bpx-player-ctrl-btn-icon",//设置按钮
				qualityItems:".bpx-player-ctrl-quality-menu-item ",//画质选择按钮
				wideIcon:".bpx-player-ctrl-wide",//宽屏按钮
				webFullScreenIcon:".bpx-player-ctrl-web",//网页全屏按钮
				fullScreenIcon:".bpx-player-ctrl-full",//全屏按钮
				qualityControlBar:".bpx-player-ctrl-quality-menu",//原生画质切换面板
				speedControlBar:".bpx-player-ctrl-playbackrate",//原生速度切换面板
				highlightBar:".bpx-player-pbp",//高能进度条
				touchControlMask:".bilibili-player-dm-tip-wrap",//原生视频遮罩
			},{
				filter:/bangumi/,
				settingRootElement:`[aria-label="哔哩哔哩播放器"]`,//设置面板的挂载节点
				showElement:`[aria-label="哔哩哔哩播放器"]`,
				videoTag:"#bilibili-player video",
				settingIcon:".squirtle-video-setting .squirtle-setting-icon",
				qualityItems:".bui-select-quality-menu .bui-select-list .bui-select-item",
				wideIcon:".squirtle-video-widescreen",//宽屏按钮
				webFullScreenIcon:".squirtle-video-pagefullscreen",//网页全屏按钮
				fullScreenIcon:".squirtle-video-fullscreen",//全屏按钮
				qualityControlBar:".squirtle-video-quality .squirtle-select-list",//原生画质切换面板
				speedControlBar:".squirtle-video-speed .squirtle-select-list",//原生速度切换面板
				highlightBar:"#bilibili_pbp",//高能进度条
				touchControlMask:".bilibili-player-dm-tip-wrap",//原生视频遮罩
			},
		],
	}
	let method={
		//获取video标签
		getVideoTag(){
			let video=document.querySelector(this.elementMapper["videoTag"]);
			if(video){
				
			}else{
				video=document.querySelector(this.elementMapper["videoTag_replace"]);
			}
			return video;
		},
		getHighlightBar(){
			return document.querySelector(this.elementMapper["highlightBar"]);
		},
		getWideIcon(){
			let wideIcon=document.querySelector(this.elementMapper["wideIcon"]);
			return wideIcon;
		},
		getWebFullScreenIcon(){
			let webFullScreenIcon=document.querySelector(this.elementMapper["webFullScreenIcon"]);
			return webFullScreenIcon;
		},
		getFullScreenIcon(){
			let fullScreenIcon=document.querySelector(this.elementMapper["fullScreenIcon"]);
			return fullScreenIcon;
		},
		getQualityItems(){
			let qualityItems=document.querySelectorAll(this.elementMapper["qualityItems"]);
			return qualityItems;
		},
		getSettingIcon(){
			let settingIcon=document.querySelector(this.elementMapper["settingIcon"]);
			return settingIcon;
		},
		getShowElement(){
			let showElement=document.querySelector(this.elementMapper["showElement"]);
			return showElement;
		},
		getQualityControlBar(){
			let qualityControlBar=document.querySelector(this.elementMapper["qualityControlBar"]);
			return qualityControlBar;
		},
		getSpeedControlBar(){
			let speedControlBar=document.querySelector(this.elementMapper["speedControlBar"]);
			return speedControlBar;
		},
		iswideScreen(){//是否是宽屏
			let iswideScreen=false;
			let element=this.getShowElement().parentElement;
			if(element.classList.contains("mode-widescreen")||element.dataset.screen=="wide"){
				iswideScreen=true;
			}
			return iswideScreen;
		},
		isfullScreen(){//是否是宽屏
			let isfullScreen=false;
			let element=this.getShowElement().parentElement;
			if(element.classList.contains("mode-fullscreen")||element.dataset.screen=="full"){
				isfullScreen=true;
			}
			return isfullScreen;
		},

		////////////////////////////////功能函数
		/**
		 * 更改视频速度
		 * @param {number} speed 要更改的速度
		 */
		changeVideoSpeed(speed){
			if(speed>=0.1&&speed<=16){
				let savedSpeed=Cookies.get("videoSpeed");
				this.preSpeed=savedSpeed?savedSpeed:1;
				this.getVideoTag().playbackRate=speed;
				Cookies.set("videoSpeed", speed);
			}
		},
		wideSwitch(){//切换宽屏
			this.getWideIcon().click();
		},
		webFullScreenSwitch(){//切换网页全屏
			this.getWebFullScreenIcon().click();
		},
		fullScreenSwitch(){//切换全屏
			this.getFullScreenIcon().click();
		},
		
		/**
		 * 执行按键功能
		 * @param {string} key 键值
		 */
		keyHandler(key){
			switch (key) {
				case "openSettingShortcut":
					this.switchSettingPanel();
					break;
				case "speedUp":
					{
						let defaultChangeSpeed=this.config.defaultChangeSpeed.value;
						let speed=this.getVideoTag().playbackRate;
						nextSpeed=new BigNumber(speed).plus(defaultChangeSpeed);
						this.changeVideoSpeed(nextSpeed);
						this.messageShow(`播放速度增加至 ${this.getVideoTag().playbackRate}`);
					}
					break;
				case "speedDown":
					{
						let defaultChangeSpeed=this.config.defaultChangeSpeed.value;
						let speed=this.getVideoTag().playbackRate;
						nextSpeed=new BigNumber(speed).minus(defaultChangeSpeed);
						this.changeVideoSpeed(nextSpeed);
						this.messageShow(`播放速度减少至 ${this.getVideoTag().playbackRate}`);
					}
					break;
				case "switchSpeedChange":
					{
						let videoTag=this.getVideoTag();
						if(videoTag.playbackRate==1){
							let switchSpeed=this.preSpeed?this.preSpeed:this.config.defaultSpeed.value;
							this.changeVideoSpeed(switchSpeed);
						}else{
							this.changeVideoSpeed(1);
						};
						this.messageShow(`播放速度设置为 ${this.getVideoTag().playbackRate}`);
					}
					break;
				case "switchWide":
					this.wideSwitch();
					break;
				case "switchWebFullScreen":
					this.webFullScreenSwitch();
					break;
				case "switchFullScreen":
					this.fullScreenSwitch();
					break;
				default:
					break;
			}
		},

		////////////////////////////////初始化函数
		qualityControlBarInit(){//画质切换面板初始化
			let qualityControlBarList=this.getQualityControlBar().querySelectorAll("li");
			for (let i = 0; i < qualityControlBarList.length; i++) {
				let element = qualityControlBarList[i];
				let text=element.textContent;
				if(/登录/.test(text)){//需要登录,登录后不显示
					continue;
				}else if(/大会员/.test(text)){//需要登录+大会员
					
				}else{
					if(this.config.autoQuality.value){
						element.click();
					}
					console.log(text);
					break;
				}
				
			}
		},
		speedControlBarInit(){//原生速度切换面板初始化
			let speedControlBar=this.getSpeedControlBar();
			speedControlBar.addEventListener("click",(e)=>{
				let target=e.target;
				let speed=Number(target.textContent.replace("x",""));
				console.log(speed);
			});
		},
		controlBarInit(){//设置图标初始化
			console.log("开始初始化控制栏");
			this.getSettingIcon().addEventListener("click",this.switchSettingPanel.bind(this));
			this.speedControlBarInit();
			this.qualityControlBarInit();
			console.log("开始监听触摸事件");
			this.touchHandler(this.getShowElement());
		},
		init(){//按照时钟周期性初始化，只有当需要的元素出来时才会初始化
			let settingControlInit=()=>{
				if(this.maxInitTimes){
					setTimeout(() => {
						try {
							console.log("初始化开始，更改屏幕尺寸");
							let {list,value}=this.config.defaultScreenSize;
							switch (list[value].key) {
								case "wide":
									if (this.iswideScreen()) {
										
									}else{
										this.wideSwitch();
									}
									break;
								case "webFullScreen":
									if (this.isfullScreen()) {
										
									}else{
										this.webFullScreenSwitch();
									}
									break;
								default:
									break;
							};
							console.log("屏幕尺寸更改完毕，开始调节视频速度");
							if (this.config.autoSpeed.value) {
								let speed=Cookies.get("videoSpeed");
								let defaultSpeed=speed?speed:this.config.defaultSpeed.value;
								this.changeVideoSpeed(defaultSpeed);
								this.messageShow("已自动调整速度为"+defaultSpeed+"倍");
							}
							this.controlBarInit();
							console.log("初始化已完成");
						} catch (error) {
							console.error("播放器控制栏未加载完成，等待重新开始");
							console.error(error);
							this.maxInitTimes--;
							settingControlInit();
						}
					}, 1000);
				}
			};
			settingControlInit();
		},
	}



	//浮点数计算器
	// const floatCalc = math.create({
	// 	number: 'BigNumber',
	// 	matrix: 'Matrix',
	// 	precision: 64
	// });
	// math.config({
	// 	number: 'BigNumber',
	// 	matrix: 'Matrix',
	// 	precision: 64
	// })
	GM_addStyle(GM_getResourceText("MaterialIcons"));
	let tampermonkeyTool={
		settingName: 'tampermonkeyTool默认设置',//设置面吧标题
		elementMapper:[{
			filter:/.*/,//正则
			settingRootElement:"body",//设置面板的挂载节点
			showElement:`body`,//全屏时的最大元素
			videoTag:"#bilibili-player video",//video标签
			videoTag_replace:"#bilibili-player bwp-video",//video标签
			settingIcon:".bilibili-player-video-btn-setting .bp-svgicon",//设置按钮
			qualityItems:".bui-select-quality-menu .bui-select-list .bui-select-item",//画质选择按钮
			wideIcon:".bilibili-player-video-btn-widescreen",//宽屏按钮
			webFullScreenIcon:".bilibili-player-video-web-fullscreen",//网页全屏按钮
			fullScreenIcon:".bilibili-player-video-btn-fullscreen",//全屏按钮
			qualityControlBar:".bilibili-player-video-quality-menu .bui-select-list",//原生画质切换面板
			speedControlBar:".bilibili-player-video-btn-speed-menu",//原生速度切换面板
			highlightBar:"#bilibili_pbp",//高能进度条
			touchControlMask:".bilibili-player-dm-tip-wrap",//原生视频遮罩
		}],//元素映射表
		default:{//默认设置
			defaultScreenSize:{//默认屏幕尺寸
				name:"默认屏幕尺寸",
				type:"select",
				title:`因浏览器限制，只有用户行为才能全屏（不会有人真的开始就全屏吧，不会吧不会吧）`,
				list:[{
					key:"default",
					content:"默认大小"
				},{
					key:"wide",
					content:"宽屏"
				},{
					key:"webFullScreen",
					content:"网页全屏"
				}],
				value:0
			},
			autoQuality:{//自动选择最高画质
				name:"自动选择最高画质",
				type:"bool",
				value:false
			},
			autoSpeed:{//还原上次的播放速度
				name:"还原上次的播放速度",
				title:"仅在自动开播或连播情况下生效",
				type:"bool",
				value:false
			},
			rangeTransition:{//滑动条动画
				name:"启用滑动条过渡动画",
				type:"bool",
				title:"开启后,滑动条滑动时会有0.1s的过渡动画效果，但可能会显得不跟手",
				value:false
			},
			useShadowRoot:{//shadowroot
				name:"启用shadowroot",
				type:"bool",
				title:"若设置面板样式异常可以尝试开启此项，需重开设置面板",
				value:false
			},
			shortcutPreventDefault:{//取消快捷键默认行为
				name:"取消快捷键默认行为",
				type:"bool",
				title:"开启后,按快捷键不会触发默认行为（复制粘贴等）",
				value:false
			},
			keyBindOne2One:{
				name:"根据键位绑定快捷键",
				type:"bool",
				title:"关闭后将根据实际输出进行绑定",
				value:true
			},
			openSettingShortcut:{//快捷键打开设置
				name:"打开设置",
				type:"keyboard",
				value:"s",
				code:"KeyS"
			},
			switchSpeedChange:{//快捷键打开设置
				name:"恢复默认速度/改变速度",
				type:"keyboard",
				title:"若更改过视频速度，则使用更改后的速度，否则使用设置中的默认速度",
				value:"z",
				code:"KeyZ"
			},
			speedDown:{//减速
				name:"减速快捷键",
				type:"keyboard",
				value:"x",
				code:"KeyX"
			},
			speedUp:{//加速
				name:"加速快捷键",
				type:"keyboard",
				value:"c",
				code:"KeyC"
			},
			switchWide:{//切换宽屏
				name:"切换宽屏",
				type:"keyboard",
				value:",",
				code:"Comma"
			},
			switchWebFullScreen:{//网页全屏
				name:"网页全屏",
				type:"keyboard",
				value:".",
				code:"Period"
			},
			switchFullScreen:{//全屏
				name:"全屏",
				type:"keyboard",
				value:"/",
				code:"Slash"
			},
			defaultSpeed:{//默认速度
				name:"默认播放速度",
				type:"range",
				start:0.1,
				end:10,
				step:0.1,
				value:1,
			},
			defaultChangeSpeed:{//变速幅度
				name:"变速幅度",
				type:"range",
				start:0.05,
				end:1,
				step:0.05,
				value:0.1,
			},
			touchProcess:{
				type:"hiddenSwitch",
				key:"touchProcess",//字段名
				name:"触屏控制进度",
				value:true
			},
			touchVolume:{
				type:"hiddenSwitch",
				key:"touchVolume",//字段名
				name:"触屏控制音量",
				value:true
			},
			touchHandler:{//变速幅度
				name:"触屏处理",
				type:"checkbox",
				value:[
					"touchProcess",//指向type="hiddenSwitch"的对应键值
					"touchVolume",
				],
			},
		},
		config:GM_listValues(),//保存的设置
		maxInitTimes:6,//最大初始化次数
		gridListSettingMapper:{},//网格列表
		keyboardBindList:{},//已用按键列表
		touchList:{},//触屏按下的手指列表
		getElementMapper(){//获取元素映射
			let url=window.location.href;
			for(let i=0;i<this.elementMapper.length;i++){
				if(this.elementMapper[i].filter.test(url)){
					this.elementMapper=this.elementMapper[i];
					//函数置空
					this.getElementMapper=()=>{};
					console.log(this.elementMapper);
					return;
				}
			}
		},
		getSettingRootElement(){
			let settingRootElement=document.querySelector(this.elementMapper["settingRootElement"]);
			return settingRootElement;
		},
		/**
		 * 
		 * @param {*} value 监听的元素
		 * @param {String} key 监听的值
		 */
		watchValue(value,key){//监听指定key的值的变化
			Object.defineProperty(value, key, { set: function (x) {
				this.preValue=this[key];
				this["_"+key] = x;
				if(value[`${key}_onChange`]){
					value[`${key}_onChange`](x,this.preValue);
				}
			}, get: function () {
				return this["_"+key];
			}});
		},
		/**
		 * @property {boolean} switchValue 开关的当前状态
		 * @property {Function} switch 切换开关状态函数
		 * @property {Function} onChange 监听状态切换事件
		 * @property {Function} initValue 初始化开关的状态
		 * @returns {HTMLDivElement} 开关组件
		 */
		createSwitch(){//创建开关
			let container=document.createElement("div");
			container.style=`
				display:inline-block;
				width:30px;
				vertical-align:middle;
			`;
			let shadowRoot=container;
			if (this.config.useShadowRoot.value) {
				shadowRoot=container.attachShadow({mode:"open"});
			}
			let style=document.createElement("style");
			style.innerHTML=`
				.switchTag{
					position:relative;
					overflow:hidden;
					height:20px;
					border-radius:15px;
					background-color:#757575;
					cursor:pointer;
				}
				.switchDotBg{
					position:absolute;
					width:0;
					height:100%;
					border-radius:15px;
					background-color:#00a1d6;
					transition:.3s;
				}
				.switchDot{
					position:absolute;
					width:16px;
					height:16px;
					border-radius:15px;
					background-color:#fff;
					top:2px;
					left:2px;
					transition:.3s;
				}
			`;
			shadowRoot.appendChild(style);

			let switchTag=document.createElement("div");
			switchTag.classList.add("switchTag");
			container.switchValue=false;
			let switchDotBg=document.createElement("div");
			switchDotBg.classList.add("switchDotBg");
			switchTag.appendChild(switchDotBg);
			let switchDot=document.createElement("div");
			switchDot.classList.add("switchDot");
			switchTag.appendChild(switchDot);
			let switchFunction=()=>{//切换处理函数
				if(container.switchValue){
					switchDotBg.style.width="0";
					switchDot.style.left="2px";
				}else{
					switchDotBg.style.width="100%";
					switchDot.style.left="calc(100% - 18px)";
				}
				container.switchValue=!container.switchValue;
				if(container.onChange)container.onChange(container.switchValue);
			};
			//添加点击切换事件
			switchTag.addEventListener("click",switchFunction);
			container.switch=switchFunction;
			container.initValue=(trueOrFalse)=>{
				if(trueOrFalse)switchFunction();
			};
			shadowRoot.append(switchTag);
			return container;
		},
		/**
		 * @param {array} list 选项列表
		 * @property list[i].key 选项的key
		 * @property list[i].name 选项的显示文本
		 * @property list[i].value 选项的值
		 * @property list[i].title 选项的说明
		 * @property {array} list 当前所有选项的状态列表
		 * @property {Function} onChange 监听状态切换事件
		 * @returns {HTMLDivElement} 多选框组件
		 */
		createCheckBox(list){//创建多选框
			let container=document.createElement("div");
			let shadowRoot=container;
			if (this.config.useShadowRoot.value) {
				shadowRoot=container.attachShadow({mode:"open"});
			}
			let style=document.createElement("style");
			style.innerHTML=`
				.checkBoxTag{
					position:relative;
					cursor:pointer;
					padding-left:2em;
				}
				.checkBoxTag:hover{
					color:#00a1d6!important;
				}
				.checkBoxIcon{
					position:absolute;
				}
				.checkBoxIcon:after{
					font-family: 'Material Icons';
					font-size: 17px;
					content:"\\E835";
				}
				.checkBoxIcon.checked:after{
					color:#00a1d6;
					content:"\\E834";
				}
				.checkboxdiscrible{
					margin:0;
					width:calc(100% - 24px);
					padding-left:24px;
					line-height:24px;
					overflow-wrap:anywhere;
					white-space:break-spaces;
				}
			`;
			shadowRoot.appendChild(style);
			for (let index = 0; index < list.length; index++) {
				const element = list[index];
				let {type,key,name,value,title}=element;
				if (type!=="hiddenSwitch") continue;

				let checkBoxTag=document.createElement("div");
				checkBoxTag.classList.add("checkBoxTag");
				
				this.gridListSettingMapper[key]=checkBoxTag;
				checkBoxTag.dependency=[];

				if (title) {
					checkBoxTag.title=title;
				}
				let checkBoxIcon=document.createElement("span");
				checkBoxIcon.classList.add("checkBoxIcon");
				checkBoxTag.appendChild(checkBoxIcon);
				let checkboxdiscrible=document.createElement("p");
				checkboxdiscrible.classList.add("checkboxdiscrible");
				checkboxdiscrible.textContent=name;
				checkBoxTag.appendChild(checkboxdiscrible);
				//初始化状态
				checkBoxTag.ischecked=value;
				if(value){
					checkBoxIcon.classList.add("checked");
				}
				checkBoxTag.addEventListener("click",()=>{
					element.value=!element.value;
					checkBoxTag.ischecked=element.value;
					if (element.value) {
						checkBoxIcon.classList.add("checked");
					}else{
						checkBoxIcon.classList.remove("checked");
					}
					this.saveValue(key);
					if(container.onChange)container.onChange(list);
				});

				checkBoxTag.valueChangeHandler=(key)=>{
					let {value}=this.config[key];
					if(value!=checkBoxTag.ischecked)
						checkBoxTag.click();
				}
				shadowRoot.append(checkBoxTag);
			}
			container.list=list;
			return container;
		},
		/**
		 * @param {object} content 显示内容
		 * @param {string} title 内容提示文本
		 * @returns {HTMLDivElement} 按钮组件
		 */
		 createButton(content,title){//创建按钮
			let container=document.createElement("div");
			let shadowRoot=container;
			if (this.config.useShadowRoot.value) {
				shadowRoot=container.attachShadow({mode:"open"});
			}
			let style=document.createElement("style");
			style.innerHTML=`
				.btnTag{
					position:relative;
					border:2px solid transparent;
					padding:5px;
					cursor:pointer;
				}
				.btnTag:before,.btnTag:after{
					content:"";
					position:absolute;
					top:0;
					left:0;
					width:0;
					height:0;
					border-top-width:0;
					border-right-width:0;
					border-color: #00a1d6 #00a1d6 transparent transparent;
					border-style: solid solid hidden hidden;
					transition:
						width 0.3s ease-out 0.3s,
						height 0.3s ease-out,
						border-width 0s ease-out 0.6s,
						left 0.3s ease-out 0.3s,
						top 0.3s ease-out;
				}
				.btnTag:after{
					transform: rotate(180deg);
					top:100%;
					left:100%;
				}
				.btnTag:hover:before,.btnTag:hover:after{
					width:100%;
					height:100%;
					border-top-width:2px;
					border-right-width:2px;
					transition: 
						width 0.3s ease-out,
						height 0.3s ease-out 0.3s,
						top 0.3s ease-out 0.3s,
						left 0.3s ease-out;
				}
				.btnTag:hover:after{
					top:0;
					left:0;
				}
				.btnTag:active{
					color:#00a1d6;
				}
			`;
			shadowRoot.appendChild(style);

			let btnTag=document.createElement("div");
			btnTag.classList.add("btnTag");
			if (title) btnTag.title=title;
			btnTag.append(content);
			shadowRoot.append(btnTag);
			return container;
		},
		/**
		 * @param {object} iconCode 图标的代码编号
		 * @param {string} iconFamily 图标的fontFamily
		 * @returns {HTMLDivElement} 图标组件
		 */
		createIcon(iconCode,iconFamily){//创建按钮
			let iconTag=document.createElement("span");
			iconTag.classList.add(iconFamily?iconFamily:"material-icons");
			iconTag.innerHTML=iconCode;
			return iconTag;
		},
		/**
		 *
		 * @param {number} start 左断点
		 * @param {number} end 右断点
		 * @param {number} step 步长
		 * @property {number} stepNumb 表示选中的是第几个点
		 * @property {number} trueNumb 显示的数字
		 * @property {Function} onChange 滚动条滑动时的回调函数
		 * @property {Function} onChangeEnd 滚动条滑动结束时的回调函数
		 * @property {Function} initValue 设置初始值
		 * @property {Function} setTransition 设置是否启用过渡特效
		 * @returns {HTMLDivElement} 滚动条组件
		 */
		createProcessBar(start,end,step){//创建进度条
			//点的个数
			let pointNum=new BigNumber(end)
							.minus(start)
							.dividedBy(step);
			let container=document.createElement("div");
			let shadowRoot=container;
			if (this.config.useShadowRoot.value) {
				shadowRoot=container.attachShadow({ mode: 'open' });
			}
			let style=document.createElement("style");
			style.innerHTML=`
				.processContent{
					position:relative;
					display:flex;
					flex-direction:row;
					height:18px;
				}
				.processControlBtn{
					height:18px;
					width:18px;
					line-height:18px;
					font-weight:bold;
					font-size:18px;
					text-align:center;
					background-color:transparent;
					color:#fff;
					cursor:pointer;
				}
				.processControlBtn:hover{
					color:#00a1d6;
				}
				.processControlBtn.disabled{
					color:rgb(80,80,80);
					cursor:not-allowed;
				}
				.processControlBtn_minus:after{
					font-family: 'Material Icons';
					content:"\\E15C";
					width:100%;
					height:100%;
				}
				.processControlBtn_plus:after{
					font-family: 'Material Icons';
					content:"\\E147";
					width:100%;
					height:100%;
				}
				.processBarContent{
					position:relative;
					margin-left:9px;
					margin-right:9px;
					flex:1;
				}
				.processBar{
					position:relative;
					top:calc(50% - 1px);
					height:2px;
					overflow:hidden;
					background-color:rgb(80, 80, 80);
					border-radius:2px;
				}
				.activeProcessBar{
					position:absolute;
					top:0;
					left:0;
					height:100%;
					background-color:#00a1d6;
				}
				.processDot{
					position:absolute;
					top:50%;
					left:0;
					transform: translate(-50%,-50%);
					width:12px;
					height:12px;
					border-radius:50%;
					background-color:#00a1d6;
					cursor:pointer;
				}
				.activeProcessBar.useTransition,
				.processDot.useTransition{
					transition:.1s;
				}
			`;
			shadowRoot.append(style);

			//整个进度条
			let processContent=document.createElement("div");
			processContent.classList.add("processContent");
			//减号
			let minusBtn=document.createElement("span");
			minusBtn.classList.add("processControlBtn");
			minusBtn.classList.add("processControlBtn_minus");
			//加号
			let plusBtn=document.createElement("span");
			plusBtn.classList.add("processControlBtn");
			plusBtn.classList.add("processControlBtn_plus");
			
			//进度条+点容器
			let processBarContent=document.createElement("div");
			processBarContent.classList.add("processBarContent");
			//进度条横条
			let processBar=document.createElement("div");
			processBar.classList.add("processBar");
			//已选进度
			let activeProcessBar=document.createElement("div");
			activeProcessBar.classList.add("activeProcessBar");
			//进度条圆点
			let processDot=document.createElement("div");
			processDot.classList.add("processDot");
			//切换启用过渡特效
			let setTransition=(useTransition)=>{
				if(useTransition){
					processDot.classList.add("useTransition");
					activeProcessBar.classList.add("useTransition");
				}else{
					processDot.classList.remove("useTransition");
					activeProcessBar.classList.remove("useTransition");
				}
			}
			container.setTransition=setTransition;
			//执行一次
			setTransition(this.config.rangeTransition.value);

			minusBtn.addEventListener("click",()=>{
				if(container.stepNumb<=0)return;
				//每个点的长度
				let stepNumb=--container.stepNumb;
				//更改真实值
				container.trueNumb=new BigNumber(stepNumb)
										.multipliedBy(step)
										.plus(start)
										.valueOf();
				if(container.onChangeEnd){
					container.onChangeEnd(container.trueNumb);
				}
			});
			plusBtn.addEventListener("click",()=>{
				if(container.trueNumb>=end)return;
				//每个点的长度
				let stepNumb=++container.stepNumb;
				//更改真实值
				container.trueNumb=new BigNumber(stepNumb)
										.multipliedBy(step)
										.plus(start)
										.valueOf();
				if(container.onChangeEnd){
					container.onChangeEnd(container.trueNumb);
				}
			});
			processDot.addEventListener("mousedown",(e)=>{
				let mouseDownX=e.pageX;
				let left=processDot.offsetLeft;
				let width=processBar.offsetWidth;
				let documentMouseMoveFunction=(e)=>{
					let mouseX=e.pageX;
					let moveX=mouseX-mouseDownX;
					//left值
					let newLeft=left+moveX;
					if(newLeft<0){
						newLeft=0;
					}else if(newLeft>width){
						newLeft=width;
					}
					//每个点的长度
					let size=width/pointNum;
					//四舍五入
					let numb=new BigNumber(newLeft)
								.dividedBy(size)
								.toFixed(0);
					if(container.stepNumb!==numb){
						container.stepNumb=numb;
						//真实的值
						let trueNumb=new BigNumber(numb)
										.multipliedBy(step)
										.plus(start)
										.valueOf();
						container.trueNumb=trueNumb;
					}
				};
				document.addEventListener("mousemove",documentMouseMoveFunction);
				let docuemntMouseUpFunction=()=>{
					//监听移动结束事件
					if(container.onChangeEnd){
						container.onChangeEnd(container.trueNumb);
					}
					document.removeEventListener("mousemove",documentMouseMoveFunction);
					document.removeEventListener("mouseup",docuemntMouseUpFunction);
				};
				document.addEventListener("mouseup",docuemntMouseUpFunction);
			});
			processBar.append(activeProcessBar);
			processBarContent.append(processBar);
			processBarContent.append(processDot);
			processContent.append(minusBtn);
			processContent.append(processBarContent);
			processContent.append(plusBtn);
			//监听stepNumb的更改
			this.watchValue(container,"stepNumb");
			container["stepNumb_onChange"]=(stepNumb)=>{
				if (stepNumb==0) {
					plusBtn.classList.remove("disabled");
					minusBtn.classList.add("disabled");
				}else if (stepNumb==pointNum) {
					plusBtn.classList.add("disabled");
					minusBtn.classList.remove("disabled");
				}else{
					plusBtn.classList.remove("disabled");
					minusBtn.classList.remove("disabled");
				}
				let leftWidthNum=new BigNumber(stepNumb)
									.multipliedBy(100)
									.dividedBy(pointNum);
				let leftWidth=leftWidthNum+"%";
				//设置进度条
				activeProcessBar.style.width=leftWidth;
				processDot.style.left=leftWidth;
			};

			//监听trueNumb的更改
			this.watchValue(container,"trueNumb");
			//将onChange事件绑定
			Object.defineProperty(container,"trueNumb_onChange", { get: function (x) { return this.onChange } });
			//暴露初始化函数
			container.initValue=(trueNumb)=>{
				//计算是第几个点
				let numb=new BigNumber(trueNumb)
							.minus(start)
							.dividedBy(step);
				//四舍五入
				numb=numb.toFixed(0);
				container.stepNumb=numb;
				container.trueNumb=trueNumb;
			};
			container.stepNumb=0;
			container.trueNumb=start;
			shadowRoot.append(processContent);
			return container;
		},
		/**
		 * 生成下拉框
		 * @param {array} list 选项列表
		 * @param {number} showNumber 候选框显示数量，默认为4个
		 * @param {number} choiceIndex 默认选中，默认为第一个
		 * @property {number} choiceIndex 选中的索引，更改受控
		 * @property {object} value 选中的值
		 * @property {object} showValue 页面中显示的值
		 * @property {Function} onValueChange 值改变时的回调函数
		 * @returns {HTMLDivElement} 下拉框组件
		 */
		createSelect(list,showNumber=4,choiceIndex=0){
			let selectBoxContent=document.createElement("div");
			let shadowRoot=selectBoxContent;
			if (this.config.useShadowRoot.value) {
				shadowRoot=selectBoxContent.attachShadow({mode:"open"});
			}
			//创建style标签
			let style=document.createElement("style");
			style.innerHTML=`
				.selectItemBoxPlaceHolder{
					position:relative;
					height:18px;
					overflow:hidden;
					text-align:center;
					vertical-align:middle;
					line-height:20px;
					border:1px solid #fff;
				}
				.selectItemBoxPlaceHolder.focus{
					overflow:visible;
				}
				.selectItemBoxPlaceHolder.focus .selectItemBoxPlaceHolderIcon{
					transform:rotate(180deg);
				}
				.selectItemBoxPlaceHolderIcon{
					position:absolute;
					right:5px;
					top:0;
					bottom:0;
					margin:auto;
					transition:all 0.3s;
				}
				.selectItemBox{
					position:absolute;
					display:grid;
					top:calc(100% + 5px);
					width:100%;
					overflow:hidden;
					height:${(list.length>showNumber?showNumber:list.length)*20}px;
					background-color:rgba(0,0,0,0.5);
					border:1px solid #fff;
					z-index:100
				}
				.selectItem{
					height:18px;
					margin:1px;
					width:calc(100% - 2px);
					text-align:center;
					vertical-align:middle;
					line-height:20px;
					color:black;
					background-color:#fff;
				}
				.selectItem.active{
					background-color:#00a1d6;
				}
			`;
			shadowRoot.append(style);
			//暴露的方法
			this.watchValue(selectBoxContent,"choiceIndex");
			this.watchValue(selectBoxContent,"value");
			this.watchValue(selectBoxContent,"showValue");
			//显示框
			let selectItemBoxPlaceHolder=document.createElement("div");
			selectItemBoxPlaceHolder.classList.add("selectItemBoxPlaceHolder");
			selectItemBoxPlaceHolder.tabIndex=0;
			let selectItemBoxPlaceHolderIcon=document.createElement("span");
			selectItemBoxPlaceHolderIcon.innerText="▼";
			selectItemBoxPlaceHolderIcon.classList.add("selectItemBoxPlaceHolderIcon");
			selectItemBoxPlaceHolder.append(selectItemBoxPlaceHolderIcon);
			//聚焦事件
			selectItemBoxPlaceHolder.addEventListener("click",(e)=>{
				selectItemBoxPlaceHolder.classList.toggle("focus");
			});
			selectItemBoxPlaceHolder.addEventListener("blur",(e)=>{
				selectItemBoxPlaceHolder.classList.remove("focus");
			});
			//选项框
			let selectItemBox=document.createElement("div");
			selectItemBox.classList.add("selectItemBox");
			//滚动事件
			let selectItemBoxWhellFunc=(e)=>{
				this.scrollThrottle(selectItemBox.scrollTo({
					top: selectItemBox.scrollTop+Math.sign(e.deltaY)*20,
					left: selectItemBox.scrollLeft+Math.sign(e.deltaX)*20,
					behavior: 'auto'
				}),100);
				e.stopPropagation();
				e.preventDefault();
			};
			selectItemBox.addEventListener("wheel",selectItemBoxWhellFunc);
			for(let i=0;i<list.length;i++){
				let element=list[i];
				let {key,content}=element;
				let selectItem=document.createElement("div");
				element.selectItem=selectItem;
				selectItem.classList.add("selectItem");
				selectItem.index=i;
				selectItem.key=key;
				selectItem.switchActive=()=>{
					selectItem.classList.toggle("active");
				};
				//选择选项事件
				selectItem.addEventListener("click",()=>{
					selectBoxContent.choiceIndex=i;
				});
				if (i==choiceIndex) {
					selectBoxContent.value=element;
					selectItem.switchActive();
				}
				selectItem.append(content);
				selectItemBox.append(selectItem);
			};
			//事件绑定
			selectBoxContent["choiceIndex_onChange"]=(changedChoiceIndex)=>{
				selectBoxContent.value.selectItem.switchActive();
				selectBoxContent.value=list[changedChoiceIndex];
				selectBoxContent.value.selectItem.switchActive();
			};
			selectBoxContent["value_onChange"]=(changedValue)=>{
				selectBoxContent.showValue=changedValue.content;
				if(selectBoxContent.onValueChange)selectBoxContent.onValueChange(changedValue);
			};
			selectBoxContent["showValue_onChange"]=(changedValue,preValue)=>{
				if (preValue) {
					selectItemBoxPlaceHolder.lastChild.remove();
				}
				selectItemBoxPlaceHolder.append(changedValue);
			};
			selectItemBoxPlaceHolder.append(selectItemBox);
			//后添加placeholder的元素
			selectBoxContent.choiceIndex=choiceIndex;
			shadowRoot.append(selectItemBoxPlaceHolder);
			return selectBoxContent;
		},
		//节流函数
		scrollThrottle(fn,wait){
			var pre = Date.now();
			return function(){
				var context = this;
				var args = arguments;
				var now = Date.now();
				if( now - pre >= wait){
					fn.apply(context,args);
					pre = Date.now();
				}
			}
		},
		/**
		 *
		 * @param {number} value 值
		 * @param {number} min 最小值
		 * @param {number} max 最大值
		 * @param {number} step 步长
		 * @property {number} stepNumb 表示选中的是第几个点
		 * @property {number} trueNumb 显示的数字
		 * @property {Function} onChange 滚动条滑动时的回调函数
		 * @property {Function} onChangeEnd 更改结束时的回调函数
		 * @property {Function} initValue 设置初始值
		 * @returns {HTMLDivElement} 数字输入框组件
		 */
		createNumberBox(value,min,max,step){//创建数字输入框
			let container=document.createElement("div");
			container.classList.add("numberBoxContainer");
			let shadowRoot=container;
			if (this.config.useShadowRoot.value) {
				shadowRoot=container.attachShadow({ mode: 'open' });
				let MaterialIconsStyle=document.createElement("style");
				MaterialIconsStyle.innerText=GM_getResourceText("MaterialIcons");
				
				container.style=`
						display: inline-block;
						vertical-align: middle;
						width:50px;
				`;
				shadowRoot.append(MaterialIconsStyle);
			}
			let style=document.createElement("style");
			style.innerHTML=`
				.numberBoxContainer{
					display: inline-block;
					vertical-align: middle;
					width:50px;
				}
				.numberBox{
					position: relative;
					width:100%;
					height: 16px;
					font-size: 16px;
				}
				.valueBox{
					position: absolute;
					left: 0;
					top: 0;
					width: calc(100% - 16px);
					height: 100%;
					overflow: hidden;
					text-align: right;
					white-space: nowrap;
				}
				.valueBox:focus{
					border:none;
					outline: none;
				}
				.changeTools{
					position: absolute;
					display: flex;
					flex-direction: column;
					height: 100%;
					right: 0;
				}
				.numberBox .material-icons{
					font-size: 50%;
					cursor: pointer;
					user-select: none;
				}
				.numberBox .material-icons:hover{
					color: #00a1d6;
				}
			`;
			shadowRoot.append(style);

			let numberBox=document.createElement('div');
			numberBox.classList.add("numberBox");
			let valueBox=document.createElement("span");
			valueBox.classList.add("valueBox");
			valueBox.setAttribute("contenteditable","true");

			//光标指示器
			let selection=window.getSelection();
			if(this.config.useShadowRoot.value){
				selection=shadowRoot.getSelection();
			}

			//input事件预处理
			valueBox.addEventListener("keydown",(e)=>{
				//阻止事件传播
				e.stopPropagation();
				if(e.key=="Enter"){
					valueBox.blur();
					return;
				}
				//输入有效数字之前记录位置
				valueBox.preValue=valueBox.innerText;
				valueBox.anchorOffset=selection.anchorOffset;
				valueBox.focusOffset=selection.focusOffset;
			})
			//去除非法字符并
			valueBox.addEventListener("input",(e)=>{
				if(isNaN(Number(valueBox.innerText))||/ /.test(valueBox.innerText)){
					valueBox.innerText=valueBox.preValue;
					//重置光标位置
					let range = new Range();
					range.setStart(valueBox.firstChild, valueBox.anchorOffset);
					range.setEnd(valueBox.firstChild, valueBox.focusOffset);
					selection.removeAllRanges();
					selection.addRange(range);
				}
				e.stopPropagation();
			})

			valueBox.addEventListener("paste",(e)=>{
				let paste = (e.clipboardData || window.clipboardData);
				//有图片、文件则禁止
				let data=paste.files[0];
				if (data){
					console.log("已禁止图片或文件的粘贴");
					e.preventDefault();
				}
			})

			valueBox.addEventListener("blur",()=>{
				let num=Number(valueBox.innerText);
				if(isNaN(num)){
					num=min;
				}
				if(num>max)num=max;
				if(num<min)num=min;
				container.value=num;
				changehandler();
			})
			
			let changeTools=document.createElement("div");
			changeTools.classList.add("changeTools");

			//+号-号键
			let addIcon=this.createIcon("&#xe5ce;");
			addIcon.classList.add("addIcon");
			let minusIcon=this.createIcon("&#xe5cf;");
			minusIcon.classList.add("minusIcon");

			//触发changeEnd函数
			let timmerClear=(e)=>{
				if(e.button==0){
					clearInterval(changeTools.timmer);
					if(container.onChangeEnd){
						container.onChangeEnd(container.value);
					}
				}
			};
			//触发change函数
			let changehandler=()=>{
				if(container.onChange){
					container.onChange(container.value);
				}
			};

			addIcon.addEventListener("mousedown",(e)=>{
				if(e.button==0){
					let calcValue=new BigNumber(container.value)
									.plus(step)
									.valueOf();
					container.value=calcValue>max?max:calcValue;
					changehandler();
					changeTools.timmer=setInterval(()=>{
						let calcValue=new BigNumber(container.value)
										.plus(step)
										.valueOf();
						container.value=calcValue>max?max:calcValue;
						changehandler();
					},100);
				}
			});
			addIcon.addEventListener("mouseup",timmerClear);
			addIcon.addEventListener("mouseleave",timmerClear);

			minusIcon.addEventListener("mousedown",(e)=>{
				if(e.button==0){
					let calcValue=new BigNumber(container.value)
									.minus(step)
									.valueOf();
					container.value=calcValue<min?min:calcValue;
					changehandler();
					changeTools.timmer=setInterval(()=>{
						let calcValue=new BigNumber(container.value)
										.minus(step)
										.valueOf();
						container.value=calcValue<min?min:calcValue;
						changehandler();
					},100);
				}
			});
			minusIcon.addEventListener("mouseup",timmerClear);
			minusIcon.addEventListener("mouseleave",timmerClear);

			changeTools.append(addIcon);
			changeTools.append(minusIcon);
			
			numberBox.append(valueBox);
			numberBox.append(changeTools);
			
			this.watchValue(container,"value");
			container["value_onChange"]=(changedValue)=>{
				valueBox.innerHTML=changedValue;
			};
			shadowRoot.append(numberBox);
			container.value=value;
			return container;
		},
		createSettingPanel() {//创建设置面板
			//唯一化处理
			if(this.settingPanel){
				this.settingPanel.remove();
			}
			//创建确认窗口
			let confirm=document.createElement("div");
			confirm.style=`
				position:fixed;
				display:flex;
				flex-direction:column;
				min-width:660px;
				min-height:380px;
				inset:20%;
				background:rgba(33,33,33,.9);
				border:1px solid hsla(0,0%,100%,.12);
				z-index:999;
				box-shadow:rgb(0 0 0 / 25%) 0px 0px 10px 0px;
				color:white;
			`;
			confirm.innerHTML=`<div style="position:relative;width:100%;text-align:center;font-size:16px;line-height:40px;">
				${this.settingName}
			</div>`;
			let btnList=document.createElement('div');
			btnList.style=`
				position:absolute;
				font-size:16px;
				top:10px;
				right:10px;
			`;
			//刷新按钮
			let refreshBtn=this.createButton(this.createIcon("&#xe5d5;"),"重置设置");
			refreshBtn.classList.add("material-icons");
			refreshBtn.addEventListener("click",()=>{
				this.resetSetting();
			});
			btnList.append(refreshBtn);
			//关闭按钮
			let exitBtn=this.createButton(this.createIcon("&#xe5cd;"),"关闭");
			exitBtn.classList.add("material-icons");
			exitBtn.addEventListener("click",()=>{
				this.switchSettingPanel();
			});
			btnList.append(exitBtn);
			confirm.append(btnList);


			let gridBox=document.createElement("div");
			gridBox.style=`
				display:grid;
				width:100%;
				overflow:auto;
				grid-template-columns:repeat(2,50%);
			`;

			for (let i = 0; i < Object.keys(this.config).length; i++) {
				let key=Object.keys(this.config)[i];
				let {type,title} = this.config[key];
				
				if (/hidden/.test(type)){
					continue;
				}

				let grid=document.createElement("div");
				this.gridListSettingMapper[key]=grid;
				grid.dependency=[];

				grid.style="margin:10px 20px;";
				//添加说明
				if(title) grid.title=title;
				//根据类型创建设置项
				if(type=="bool"){
					let {name,value} = this.config[key];
					//开关
					let switchTag=this.createSwitch();
					switchTag.style.marginRight="10px";
					switchTag.initValue(value);
					switchTag.onChange=()=>{
						this.config[key].value=switchTag.switchValue;
						console.log(this.config);
						this.saveValue(key);
					};
					grid.valueChangeHandler=(key)=>{
						if(this.config[key].value!=switchTag.switchValue){
							switchTag.switch();
						}
					};
					grid.append(switchTag);
					//标题
					let discribe=document.createElement("span");
					discribe.innerText=name;
					grid.append(discribe);
				}else if(type=="keyboard"){
					let {name,value,code} = this.config[key];
					//标题
					let discribe=document.createElement("span");
					discribe.innerText=name;
					grid.append(discribe);
					//告诉依赖key，此key使用了这个依赖
					this.gridListSettingMapper.keyBindOne2One.dependency.push(key);

					//按键
					let keyboard=document.createElement("kbd");
					keyboard.title="点击进行设置";
					keyboard.style=`
						border: 2px solid #cdcdcd;
						margin-left:10px;
						padding: 0.25rem;
						border-radius: 0.25rem;
						font-size: .825rem;
						box-shadow: inset 0 -1px 0 0 #cdcdcd;
						cursor:pointer;
						outline:none;
					`;
					keyboard.innerText=this.config.keyBindOne2One.value?code:value;
					keyboard.tabIndex=0;
					keyboard.addEventListener("focus",()=>{
						keyboard.style.border="2px solid #00a1d6";
					});
					keyboard.addEventListener("blur",()=>{
						keyboard.style.border="2px solid #cdcdcd";
						keyboard.innerText=this.config.keyBindOne2One.value?this.config[key].code:this.config[key].value;
					});

					keyboard.addEventListener("keydown",(e)=>{
						let valueText="",
							codeText="";
						if(e.ctrlKey){
							valueText+=`Control`;
							codeText+=`Control`;
						}
						if(e.altKey){
							if(valueText)valueText+=` + `;
							if(codeText)codeText+=` + `;
							valueText+=`Alt`;
							codeText+=`Alt`;
						}
						if(e.shiftKey){
							if(valueText)valueText+=` + `;
							if(codeText)codeText+=` + `;
							valueText+=`Shift`;
							codeText+=`Shift`;
						}
						if(e.key!=="Control"&&e.key!=="Alt"&&e.key!=="Shift"){
							if(valueText)valueText+=` + `;
							if(codeText)codeText+=` + `;
							valueText+=e.key;
							codeText+=e.code;
							let result=this.config.keyBindOne2One.value?codeText:valueText;
							let keyboard=this.getShortcutKeyName(result);
							console.log(keyboard);
							if (keyboard&&keyboard!=key) {
								this.config[keyboard].name
								this.messageShow(`快捷键与 "${this.config[keyboard].name}" 冲突`);
								valueText=this.config[key].value;
								codeText=this.config[key].code;
							}else{
								this.config[key].value=valueText;
								this.config[key].code=codeText;
								this.saveValue(key);
							}
						}
						keyboard.innerText=this.config.keyBindOne2One.value?codeText:valueText;
						e.stopPropagation();
						e.preventDefault();
					});
					grid.valueChangeHandler=(key)=>{
						let {value,code} = this.config[key];
						keyboard.innerText=this.config.keyBindOne2One.value?code:value;
					}
					grid.append(keyboard);
				}else if(type=="range"){//滑动条
					let {name,start,end,step,value} = this.config[key];
					let valueBox=document.createElement("div");
					valueBox.style=`
						margin-bottom:10px;
					`;
					//标题
					let discribe=document.createElement("span");
					discribe.innerText=name;
					discribe.style.marginRight="10px";
					discribe.style.verticalAlign="middle";
					//数值
					let valueText=this.createNumberBox(value,start,end,step);
					valueBox.append(discribe);
					valueBox.append(valueText);
					grid.append(valueBox);
					valueText.onChange=(value)=>{
						this.config[key].value=value;
						this.saveValue(key);
					};

					//告诉依赖key，此key使用了这个依赖
					this.gridListSettingMapper.rangeTransition.dependency.push(key);

					console.log(name,start,end,step,value);
					let processbar=this.createProcessBar(start,end,step);
					processbar.initValue(value);
					processbar.onChange=(value)=>{
						valueText.value=value;
					};
					processbar.onChangeEnd=(value)=>{
						this.config[key].value=value;
						this.saveValue(key);
					};
					grid.valueChangeHandler=(key)=>{
						let {value} = this.config[key];
						processbar.setTransition(this.config.rangeTransition.value);
						processbar.initValue(value);
					}
					grid.append(processbar);
				}else if(type=="select"){//下拉框
					let {name,list,value} = this.config[key];
					let valueBox=document.createElement("div");
					valueBox.style=`
						margin-bottom:10px;
					`;
					//标题
					let discribe=document.createElement("span");
					discribe.innerText=name;
					discribe.style.marginRight="10px";
					valueBox.append(discribe);
					grid.append(valueBox);
					let selectBox=this.createSelect(list,4,value);
					selectBox.onValueChange=(value)=>{
						let index=selectBox.choiceIndex;
						this.config[key].value=index;
						this.saveValue(key);
					};
					grid.valueChangeHandler=(key)=>{
						let {value} = this.config[key];
						if(selectBox.choiceIndex!=value)
							selectBox.choiceIndex=value;
					}
					grid.append(selectBox);
				}else if(type=="checkbox"){//多选框
					let {name,value,totalControl,controlValue} = this.config[key];
					let valueBox=document.createElement("div");
					valueBox.style=`
						margin-bottom:10px;
					`;
					//标题
					let discribe=document.createElement("span");
					discribe.innerText=name;
					discribe.style.marginRight="10px";
					valueBox.append(discribe);

					//开关
					let switchTag=this.createSwitch();
					switchTag.style.marginRight="10px";
					switchTag.initValue(controlValue);
					switchTag.onChange=()=>{
						this.config[key].controlValue=switchTag.switchValue;
						console.log(this.config);
						this.saveValue(key);
					};

					if (totalControl) {
						valueBox.append(switchTag);
					}

					grid.append(valueBox);
					let list=value.map((item,index)=>{
						return this.config[item];
					});
					let checkboxBox=this.createCheckBox(list);
					// checkboxBox.onValueChange=(value)=>{
					// 	this.config[key].value=value;
					// };
					grid.valueChangeHandler=(key)=>{
						let {value,totalControl,controlValue} = this.config[key];
						if(totalControl&&controlValue!=switchTag.switchValue){
							switchTag.switch();
						}
					}
					grid.append(checkboxBox);
				}
				gridBox.appendChild(grid);
				
			}
			confirm.append(gridBox);
			this.getSettingRootElement().append(confirm);
			this.settingPanel=confirm;
		},
		settingPanelReload(){//重新加载设置面板
			this.settingPanel.remove();
			this.createSettingPanel();
		},
		switchSettingPanel(){//切换设置面板
			if(this.settingPanel){
				this.settingPanel.remove();
				this.settingPanel=null;
			}else{
				this.createSettingPanel();
			}
		},
		/**
		 * 执行按键功能
		 * @param {string} key 键值
		 */
		keyHandler(key){
			switch (key) {
				case "openSettingShortcut":
					this.switchSettingPanel();
					break;
				default:
					break;
			}
		},
		/**
		 * 获取按键的功能名
		 * @param {string} keyboard 快捷键字符串
		 * @returns 快捷键功能/undefined
		 */
		getShortcutKeyName(keyboard){
			for (const key in this.keyboardBindList) {
				let element = this.keyboardBindList[key];
				let {value,code}=element;
				let compairValue=value;
				if(this.config.keyBindOne2One.value)compairValue=code;
				if(compairValue===keyboard){
					return key;
				}
			}
		},
		bindKeyBoardListener(){
			document.body.addEventListener("keydown",(e)=>{
				let valueText="",
					codeText="";
				if(e.ctrlKey){
					valueText+=`Control`;
					codeText+=`Control`;
				}
				if(e.altKey){
					if(valueText)valueText+=` + `;
					if(codeText)codeText+=` + `;
					valueText+=`Alt`;
					codeText+=`Alt`;
				}
				if(e.shiftKey){
					if(valueText)valueText+=` + `;
					if(codeText)codeText+=` + `;
					valueText+=`Shift`;
					codeText+=`Shift`;
				}
				if(e.key!=="Control"&&e.key!=="Alt"&&e.key!=="Shift"){
					if(valueText)valueText+=` + `;
					if(codeText)codeText+=` + `;
					valueText+=e.key;
					codeText+=e.code;
					let result=this.config.keyBindOne2One.value?codeText:valueText;
					let key=this.getShortcutKeyName(result);
					if(key)this.keyHandler(key);
				}
				if(this.config.shortcutPreventDefault.value)e.preventDefault();
			});
		},
		messageShow(message,displayTime=2000){//提示信息显示
			//唯一化处理
			if(this.messageBox){
				this.messageBox.remove();
			}
			let messageBox=document.createElement("div");
			messageBox.classList.add("messageBox");
			messageBox.style=`
				position:fixed;
				width:fit-content;
				height:fit-content;
				top:0;
				bottom:0;
				left:0;
				right:0;
				margin:auto;
				padding:10px;
				border-radius:5px;
				background-color:rgba(255,255,255,0.8);
				box-shadow:0 0 10px rgba(0,0,0,0.5);
				z-index:9999;
			`;
			messageBox.innerText=message;
			this.messageBox=messageBox;
			this.getSettingRootElement().appendChild(messageBox);
			if(displayTime){
				setTimeout(() => {
					messageBox.remove();
				}, displayTime);
			}

		},
		/**
		 * 当key值发生改变时，用以通知页面改变
		 * @param {String} key 更改的键
		 */
		valueChangeHandler(key){
			let {type} = this.config[key];
			let gridTag=this.gridListSettingMapper[key];
			gridTag.valueChangeHandler(key);
			let dependency=gridTag.dependency;
			if(dependency.length){
				dependency.forEach((item)=>{
					this.valueChangeHandler(item);
				});
			}
		},
		saveValue(key){//保存配置
			console.log("已保存"+key);
			if(JSON.stringify(this.config[key])==JSON.stringify(this.default[key])){
				GM_deleteValue(key);
			}else{
				GM_setValue(key,this.config[key]);
			}
			//告知已更改
			this.valueChangeHandler(key);
		},
		touchHandler(element,func){
			let longPressTimer=null;
			element.addEventListener("touchstart",(e)=>{
				e.preventDefault();
				let changedtouch=e.changedTouches[0];
				let x=changedtouch.screenX,//触摸点x坐标
					y=changedtouch.screenY,//触摸点y坐标
					force=changedtouch.force,//压感
					touchId=changedtouch.identifier;
				this.getShowElement().classList.add("video-control-show");
				this.getHighlightBar().classList.add("show");
				this.touchList[touchId]=[{x,y,force,distance:0}];
				if (Object.keys(this.touchList).length==1) {
					longPressTimer=setTimeout(() => {
						if (this.touchList[touchId]) {//抬起则取消长按
							this.touchList[touchId].type="longPress";
							this.touchFunRunner(true);
						}
					}, 1000);
				}else{//多指触摸，已经不是长按了
					clearTimeout(longPressTimer);
				}
			});
			element.addEventListener("touchmove",(e)=>{
				if (e.cancelable) {
					e.preventDefault();
				}
				let ischanged=false;
				//遍历changedTouches
				for(let i=0;i<e.changedTouches.length;i++){
					let changedtouch=e.changedTouches[i];
					let newx=changedtouch.screenX,//触摸点x坐标
						newy=changedtouch.screenY,//触摸点y坐标
						newforce=changedtouch.force,//压感
						touchId=changedtouch.identifier;
					if (!this.touchList[touchId])continue;//过滤非当前元素触发的touchmove事件
					let {x,y,force}=this.touchList[touchId][0];
					let dx=newx-x,
						dy=newy-y;
					//计算角度
					let angle=Math.atan2(dy,dx)*180/Math.PI;
					if (this.touchList[touchId].type) {
					}else{//第一次滑动，判断类型
						clearTimeout(longPressTimer);//确认为取消长按监听
						if (angle>-22.5&&angle<=22.5){//右
							this.touchList[touchId].type="horizontal";
						}else if (angle>22.5&&angle<=67.5) {//右下
							this.touchList[touchId].type="topLeft";
						}else if (angle>67.5&&angle<=112.5) {//下
							this.touchList[touchId].type="vertical";
						}else if (angle>112.5&&angle<=157.5) {//左下
							this.touchList[touchId].type="topRight";
						}else if (angle>157.5||angle<=-157.5) {//左
							this.touchList[touchId].type="horizontal";
						}else if (angle>-157.5&&angle<=-112.5) {//左上
							this.touchList[touchId].type="topLeft";
						}else if (angle>-112.5&&angle<=-67.5) {//上
							this.touchList[touchId].type="vertical";
						}else if (angle>-67.5&&angle<=-22.5) {//右上
							this.touchList[touchId].type="topRight";
						}
					}
					let distance;
					switch (this.touchList[touchId].type) {
						case "horizontal":// "-"形
							distance=dx;
							break;
						case "topRight":// "/"形
							distance=(dx+dy)*Math.sqrt(2)/2;
							break;
						case "vertical":// "|"形
							distance=dy;
							break;
						case "topLeft":// "\"形
							distance=(dx-dy)*Math.sqrt(2)/2;
							break;
						default:
							break;
					}
					this.touchList[touchId].push({x:newx,y:newy,force:newforce,distance});
					ischanged=true;
				}
				if (ischanged) {//筛掉非元素触发的事件
					this.touchFunRunner(true);
				}
			});
			element.addEventListener("touchend",(e)=>{
				e.preventDefault();
				this.touchFunRunner();
				//遍历changedTouches
				for(let i=0;i<e.changedTouches.length;i++){
					let changedtouch=e.changedTouches[i];
					let newx=changedtouch.screenX,//触摸点x坐标
						newy=changedtouch.screenY,//触摸点y坐标
						newforce=changedtouch.force,//压感
						touchId=changedtouch.identifier;
					delete this.touchList[touchId];
				}
				setTimeout(() => {
					this.getShowElement().classList.remove("video-control-show");
					this.getHighlightBar().classList.remove("show");
				}, 2000);
			});

		},
		/**
		 * 
		 * @param {boolean} isshow 是否为展示状态，不是展示状态则代表直接执行
		 */
		touchFunRunner(isshow){
			let touchKeyList=Object.keys(this.touchList);
			if (touchKeyList.length==1) {
				let touch=this.touchList[touchKeyList[0]];
				let lasttouch=touch[touch.length-2];
				let nowtouch=touch[touch.length-1];
				//判断多指触控是否引用过此触摸动作
				let used=touch.used;
				if (used) {
					return;
				}
				// let ds=nowtouch.distance-lasttouch.distance;
				switch (touch.type) {
					case "horizontal":// "-"形
						if (this.config.touchProcess.value) {
							let dt=Math.floor(nowtouch.distance/20);
							if (isshow) {
								this.messageShow(`${Math.sign(dt)>0?"+":"-"} ${Math.abs(dt)} s`);
							}else{
								this.getVideoTag().currentTime+=dt;
							}
						}
						break;
					case "topRight":// "/"形
						break;
					case "vertical":// "|"形
						if (this.config.touchVolume.value) {
							let dv=Math.floor(nowtouch.distance/20);
							let volume=this.getVideoTag().volume;
							let x=new BigNumber(volume);
							let y=new BigNumber(dv).dividedBy(20);
							let newvolume=x.minus(y);
							if (newvolume>1) {
								newvolume=1;
							}else if (newvolume<0) {
								newvolume=0;
							}
							if (isshow) {
								this.messageShow(`${new BigNumber(newvolume).multipliedBy(100)} %`);
							}else{
								this.getVideoTag().volume=newvolume;
							}
						}
						break;
					case "topLeft":// "\"形
						break;
					case "longPress":// 长按
						if (isshow) {
							console.log("长按");
						}else{
							console.log("触发长按函数")
						}
						break;
					default://默认点击
						console.log("短按");
						break;
				}
			}else if (touchKeyList.length==2) {
				for (let i = 0; i < touchKeyList.length; i++) {
					const element = touchKeyList[i];
					let touch=this.touchList[element];
					let lasttouch=touch[touch.length-2];
					let nowtouch=touch[touch.length-1];
					//判断多指触控是否引用过此触摸动作
					let used=touch.used;
					if (used) {
						return;
					}
				}
			}
		},
		mixin(){//混入设置
			console.log("开始混入设置");
			let configBuffer=JSON.parse(JSON.stringify(this.default));
			//首次运行
			if(this.config.length==0){
				this.config=configBuffer;
			}else{
				for(let i=0;i<this.config.length;i++){
					let key=this.config[i];
					let value=GM_getValue(key, configBuffer[key]);
					configBuffer[key]=value;
				}
				this.config=configBuffer;
			}
			console.log("已混入设置");
		},
		resetSetting() {
			let configlist=GM_listValues();
			this.config=JSON.parse(JSON.stringify(this.default));
			for (let i=0; i<configlist.length; i++) {
				let key=configlist[i];
				this.saveValue(key);
			}
			console.log("已重置设置");
		},
		listenHistoryChange(func){//监听history变化
			console.log("开始监听history变化");
			//监听history变化
			var _wr = function(type) {
				var orig = history[type];
				return function() {
					var rv = orig.apply(this, arguments);
					var e = new Event(type);
					e.arguments = arguments;
					window.dispatchEvent(e);
					return rv;
				};
			};
			history.pushState = _wr('pushState');
			history.replaceState = _wr('replaceState');

			window.addEventListener('replaceState',()=>{
				func();
			});
			window.addEventListener('pushState',()=>{
				func();
			});
			window.addEventListener("popstate",()=>{
				func();
			});
			console.log("已监听history变化");
		},
		preInit(){//预初始化
			//根据网址得到标签选择器
			this.getElementMapper();
			this.mixin();
			console.log("开始初始化键盘映射");
			for (const key in this.config) {
				let element = this.config[key];
				let {type,value,code}=element;
				if(type=="keyboard"){
					this.keyboardBindList[key]=element;
				}
			}
			console.log("键盘映射初始化完成，开始监听键盘事件");
			this.bindKeyBoardListener();
			console.log("成功监听键盘事件，开始注册脚本设置项");
			GM_registerMenuCommand(this.settingName, this.switchSettingPanel.bind(this));
			console.log("成功注册脚本设置项");
			this.init();
			
			//路由改变重新初始化，同类型页面且无刷新页面时适用
			this.listenHistoryChange(()=>{
				this.init();
			});
		},
		init(){
			console.log("请更改init函数以继续");
		},
		main(){
			this.preInit();
		},
		...data,
		...method
	}
	
	tampermonkeyTool.main();
})()