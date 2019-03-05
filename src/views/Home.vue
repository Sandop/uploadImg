<template>
	<div class="home">
		<div class="card-number">
            <div class="card-info">
                <p>请输入身份证号码</p>
            </div>
            <input type="text" v-model="idNum" @blur="checkNum">
        </div>
        <div class="avatar" :class="{complete: headerImage}" ref="avatar">
			<input type="file" name="" id="avatar" class="avatar-file" accept="image/*" @change="uploadFile">
			<label class="avatar-label" for="avatar"></label>
		</div>
		<div class="img-wrap">
			<ul>
				<li class="img-list" v-for="(item, index) in imgArrs" :key="index">
					<img :src="item" alt="">
					<i class="delete" @click="deleteImg(index)"></i>
				</li>
			</ul>
		</div>
		<div class="upload-btn">
			<input type="button" value="上传" @click="uploadImg">
		</div>
	</div>
</template>

<script>
	// @ is an alias to /src
	//import imageUpload from "@/components/imageUpload.vue"
	import Exif from 'exif-js'

	export default {
		name: "home",
		data() {
			return {
				num: 0,	
				maxNum: 6,	//设置最大传入照片数量
				idNum: '',
				idNumOk: false,
				headerImage: '',
				avatarFile: '',
				imgArrs: []
			}
		},
		components: {
		},
		methods: {
			checkNum (){
				let IDNumReg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
				if (!(IDNumReg.test(this.idNum))) {
                    this.idNumOk = false;
					alert('身份证号格式有误,请仔细检查！');
				} else {
                    this.idNumOk = true;
                }
			},			
			// 上传文件
			uploadFile (e) {
				// this.avatarFile = e.target.value
				let files = e.target.files || e.dataTransfer.files;
				if (!files.length) return;
				this.avatarFile = files[0];
				this.imgPreview(this.avatarFile);
			},
			deleteImg (index){
				this.imgArrs.splice(index,1);
				this.num --;
			},
			removeImage (){
				this.imgArrs = [];
			},
			addImgArr (src,number){
				if (this.imgArrs.length < number) {
					this.num ++;
					this.imgArrs.push(src); 
				} else {
					alert(`最多只能加载${number}张哦！`)
				}
			},
			uploadImg (){
				if ( !this.idNumOk) {
					alert('身份证号格式有误,请仔细检查！');
                    return false;
				} else if (!this.num) {
					alert('请先选择图片！');
                    return false;
				} else {
					alert('上传成功！');
                    this.removeImage();
                    this.idNum = '';
				}
			},
			imgPreview (file) {
				let self = this;
				let Orientation;	//	拍摄方向
				// 去获取拍照时拍摄方向的信息，解决拍出来的照片旋转问题
				Exif.getData(file, function () {
					Orientation = Exif.getTag(this, 'Orientation');
				});				
				// 看支持不支持FileReader
				if (!file || !window.FileReader) return;
				if (/^image/.test(file.type)) {
					// 创建一个reader
					let reader = new FileReader();
					// 将图片2将转成 base64 格式
					reader.readAsDataURL(file);
					// 读取成功后的回调
					reader.onloadend = function () {
						let result = this.result;
						let img = new Image();
						img.src = result;
						// 判断图片是否大于100K,是就直接上传，反之压缩图片
						if (this.result.length <= 100 * 1024) {
							self.headerImage = this.result;
							self.addImgArr(this.result,self.maxNum);
							//self.postImg();
						} else {
							img.onload = function () {
								let data = self.compress(img, Orientation);
								self.headerImage = data;
								self.addImgArr(data,self.maxNum);
								//self.postImg();
							};
						}
					};
				}
			},
			postImg () {
				// 这里写接口
				this.$emit('input', this.headerImage);
				this.$refs.avatar.style.background = `url(${this.headerImage})no-repeat center/contain`
			},
			rotateImg (img, direction, canvas) {
				// 最小与最大旋转方向，图片旋转4次后回到原方向
				const minStep = 0;
				const maxStep = 3;
				if (img == null) return;
				// img的高度和宽度不能在img元素隐藏后获取，否则会出错
				let height = img.height;
				let width = img.width;
				let step = 2;
				if (step == null) {
					step = minStep;
				}
				if (direction === 'right') {
					step++;
					// 旋转到原位置，即超过最大值
					step > maxStep && (step = minStep);
				} else {
					step--;
					step < minStep && (step = maxStep);
				}
				// 旋转角度以弧度值为参数
				let degree = step * 90 * Math.PI / 180;
				let ctx = canvas.getContext('2d');
				switch (step) {
					case 0:
						canvas.width = width;
						canvas.height = height;
						ctx.drawImage(img, 0, 0);
					break;
					case 1:
						canvas.width = height;
						canvas.height = width;
						ctx.rotate(degree);
						ctx.drawImage(img, 0, -height);
					break;
					case 2:
						canvas.width = width;
						canvas.height = height;
						ctx.rotate(degree);
						ctx.drawImage(img, -width, -height);
					break;
					case 3:
						canvas.width = height;
						canvas.height = width;
						ctx.rotate(degree);
						ctx.drawImage(img, -width, 0);
					break;
				}
			},
			compress (img, Orientation) {
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				// 瓦片canvas
				let tCanvas = document.createElement('canvas');
				let tctx = tCanvas.getContext('2d');
				//let initSize = img.src.length;
				let width = img.width;
				let height = img.height;
				// 如果图片大于四百万像素，计算压缩比并将大小压至400万以下
				let ratio;
				if ((ratio = width * height / 4000000) > 1) {
					ratio = Math.sqrt(ratio);
					width /= ratio;
					height /= ratio;
				} else {
					ratio = 1;
				}
				canvas.width = width;
				canvas.height = height;
				//        铺底色
				ctx.fillStyle = '#fff';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				// 如果图片像素大于100万则使用瓦片绘制
				let count;
				if ((count = width * height / 1000000) > 1) {
					count = ~~(Math.sqrt(count) + 1); // 计算要分成多少块瓦片
					//            计算每块瓦片的宽和高
					let nw = ~~(width / count);
					let nh = ~~(height / count);
					tCanvas.width = nw;
					tCanvas.height = nh;
					for (let i = 0; i < count; i++) {
					for (let j = 0; j < count; j++) {
						tctx.drawImage(
						img,
						i * nw * ratio,
						j * nh * ratio,
						nw * ratio,
						nh * ratio,
						0,
						0,
						nw,
						nh
						);
						ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
					}
					}
				} else {
					ctx.drawImage(img, 0, 0, width, height);
				}
				// 修复ios上传图片的时候 被旋转的问题
				if (Orientation !== '' && Orientation !== 1) {
					switch (Orientation) {
					case 6: // 需要顺时针（向左）90度旋转
						this.rotateImg(img, 'left', canvas);
						break;
					case 8: // 需要逆时针（向右）90度旋转
						this.rotateImg(img, 'right', canvas);
						break;
					case 3: // 需要180度旋转
						this.rotateImg(img, 'right', canvas); // 转两次
						this.rotateImg(img, 'right', canvas);
						break;
					}
				}
				// 进行最小压缩
				let ndata = canvas.toDataURL('image/jpeg', 0.1);
				tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
				return ndata;
			}
  
		},
		
	};
</script>

<style lang="scss" scoped>
.home {
        overflow: hidden;
        width: 900px;
        height: auto;
        margin: 0 auto;

        .card-number {
            width: 100%;
            margin-bottom: 20px;
        }

		.avatar {
			position: relative;
			margin: 0 auto;
			width: 30px;
			height: 30px;
			background: url(../assets/phone.png) no-repeat center/contain;
			/*&.complete .avatar-label {
				top: 0;
				left: 0;
				width: 30px;
				height: 30px;
				background: url(../assets/phone.png) no-repeat center/contain;
			}*/
			.avatar-file {
				display: none;
			}
			.avatar-label {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
			}
		}

		.img-wrap {
			width: 100%;
			height: auto;

			ul {
				overflow: hidden;
				width: 100%;
				height: auto;
				border: 1px solid #ccc;
				box-sizing: border-box;

				li.img-list {
					position: relative;
					float: left;
                    overflow: hidden;
                    width: 440px;
                    height: 300px;
                    margin: 4px;
					
					img {
						width: 100%;
					}
					i.delete {
						position: absolute;
						top: 0;
						right: 0;
						width: 30px;
						height: 40px;
						background: url(../assets/delete.png) no-repeat center/contain;
						cursor: pointer;
						z-index: 10;
					}

				}
			}
		}

}

</style>

