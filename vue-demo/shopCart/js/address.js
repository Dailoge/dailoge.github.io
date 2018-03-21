Vue.prototype.$http = axios;
new Vue({
	el:'#app',
	data:{
		addressList:[],
		curDefault:0,
		curSelect:0,
		curMode:1,
		limitNum:3,
		showModalFlag:false,
		editNum:0,
		editName:'',
		editAddress:'',
		editPhone:'',
		addFlag:false,
		showTipsFlag:false,
	},
	mounted:function(){
		this.getAddressList();
	},
	computed:{
		filterAddress: function(){
			return this.addressList.slice(0,this.limitNum);
		},
	},
	methods:{
		getAddressList: function(){
			this.$http.get('./data/address.json').then((res)=>{
				this.addressList = res.data.result;
				this.addressList.forEach((address,index)=>{
					if(address.isDefault){
						this.curDefault = index;
					}
				});
				//console.log(res);
			}).catch((error)=>{
				console.log(error);
			});
		},
		changeSelect: function(index){
			this.curSelect = index;
		},
		changeDefault: function(index){
			this.addressList[this.curDefault].isDefault = false;
			this.addressList[index].isDefault = true;
			this.curDefault = index;
		},
		deleteAddress: function(index){
			if(index == this.curDefault){
				this.curDefault = 0;
				this.curSelect = 0;
				this.addressList[0].isDefault = true;
			}
			this.addressList.splice(index,1);
		},
		changeMode: function(index){
			this.curMode = index;
		},
		changeShowNum: function(){
			this.limitNum = this.addressList.length;
		},
		showModal: function(index){
			this.editName = this.addressList[index].userName;
			this.editAddress = this.addressList[index].streetName;
			this.editPhone = this.addressList[index].tel;
			this.editNum = index;//保存当前编辑的序号
			this.showModalFlag = true;
		},
		closeModal: function(e){
			this.showModalFlag = false;
			e.preventDefault();
		},
		saveAddress: function(e){
			if(this.addFlag){
				if (this.editName && this.editAddress && this.editPhone) {
					var address = {};
					address.userName = this.editName;
					address.streetName = this.editAddress;
					address.tel = this.editPhone;
					this.addressList.push(address);
					this.showModalFlag = false;
					this.showTipsFlag = false;
					e.preventDefault();
				}else{
					this.showTipsFlag = true;
					e.preventDefault();
				}
			}else{
				if (this.editName && this.editAddress && this.editPhone) {
					this.addressList[this.editNum].userName = this.editName;
					this.addressList[this.editNum].streetName = this.editAddress;
					this.addressList[this.editNum].tel = this.editPhone;
					this.showModalFlag = false;
					this.showTipsFlag = false;
					e.preventDefault();
				}else{
					this.showTipsFlag = true;
					e.preventDefault();
				}
			}
		},
		addAddress: function(){
			this.editName = this.editAddress = this.editPhone = '';
			this.showModalFlag = true;
			this.addFlag = true;
		}
	},

});