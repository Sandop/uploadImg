<template>
	<div class="about">
        <div class="card-number">
            <div class="card-info">
                <p>请输入身份证号码</p>
            </div>
            <input type="text" v-model="idNum" @blur="checkNum">
        </div>
		<div class="title">
            <h2>已选择{{number}}图片</h2>
            <input type="file" @change="onFileChange">
        </div>
        <div v-if="images.length >0" class="img-wrap">
            <ul class="list-box">
                <li v-for="(image,index) in images" :key="index" class="img-list">
                
                    <img :src="image" @click='delImage(index)' />
                    <div class="delete" @click='delImage(index)'>x</div>
                </li>
            </ul>            
        </div>
        <button class="remove" @click="removeImage">移除全部图片</button>
        <button class="upload" @click='uploadImage' >上传</button>
	</div>
</template>

<script>
	// @ is an alias to /src
	//import imageUpload from "@/components/imageUpload.vue"
	
	export default {
		name: "About",
		data (){
            return {
                number: 0,
                idNum: '',
                idNumOk: false,
                images: []
            }
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
            onFileChange (e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)return; 
                this.createImage(files);

            },
            createImage (file) {
                if(typeof FileReader==='undefined'){
                    alert('您的浏览器不支持图片上传，请升级您的浏览器');
                    return false;
                }
                //var image = new Image();         
                var vm = this;
                var leng = file.length;
                for(var i = 0;i < leng;i ++){
                    var reader = new FileReader();
                    reader.readAsDataURL(file[i]); 
                    reader.onload =function(e){
                        if ( vm.images.length < 6){
                            vm.number ++;
                            vm.images.push(e.target.result); 
                        } else {
                            alert('最多只能加载6张哦！')
                        }
                                                           
                    };                 
                }
            },
            delImage (index){
                this.images.splice(index,1);
                this.number --;
            },
            removeImage () {
                this.images = [];
            },
            uploadImage () {
                if ( !this.idNumOk) {
					alert('身份证号格式有误,请仔细检查！');
                    return false;
                } else if (!this.number) {
					alert('请先选择图片！');
                    return false;
                } else {
                    alert('上传成功！');
                    this.removeImage();
                    this.idNum = '';
                }
                
            }
        }
		
	};
</script>

<style lang="scss" scoped>
    .about {
        overflow: hidden;
        width: 900px;
        height: auto;
        margin: 0 auto;

        .title {
            width: 100%;
            margin-bottom: 20px;

            input {
                display: block;
                width: 70px;
                height: 30px;
                margin: 0 auto;
                margin-top: 30px;
            }
        }

        .img-wrap {
            width: 100%;
            margin-bottom: 20px;

            .list-box {
                overflow: hidden;
                width: 100%;
                border: 1px solid #ccc;

                .img-list {
                    position: relative;
                    float: left;
                    overflow: hidden;
                    width: 440px;
                    height: 300px;
                    margin: 5px;

                    img {
                        width: 100%;
                    }

                    .delete {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #ccc;
                        color: red;
                        font-size: 16px;
                        text-align: center;
                        line-height: 20px;
                        cursor: pointer;
                        z-index: 666;
                    }
                }
            }
        }

        button {
            margin: 5px;
        }

    }
</style>

