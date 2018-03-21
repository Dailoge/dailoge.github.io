Vue.prototype.$http = axios;
new Vue({
	el:'#app',
	data:{
		productList:[],
		curProduct:[],
		checkAllFlag:false,
		totalMoney:0,
		allCheckNum:0,
		curDeleteIndex:0,
		showModel:false,
	},
	created:function(){
		this.cartView();
	},
	filters:{
		formatMoney: function(money){
			return "$" + money + '';
		}
	},
	methods:{
		cartView: function(){
			this.$http.get('data/cartData.json').then((res)=>{
				this.productList = res.data.result.list;
				//console.log(this.productList);
				//this.totalMoney = res.data.result.totalMoney;
			}).catch(function(error){
				console.log(error);
			});
		},
		changeCheck: function(item){
			this.allCheckNum = 0;//所有的商品选中个数,如果都选中了,应该把checkAllFlag置为true
			if(typeof item.checked == "undefined"){
				this.$set(item,"checked",true);
			}else{
				if(item.checked){
					//如果在全选的状态下,有商品变为非选中,则应把checkAllFlag置为false
					this.checkAllFlag = false;
				}
				item.checked = !item.checked;
			}
			this.productList.forEach((item,index)=>{
				if(item.checked){
					this.allCheckNum++;
				}
			});
			if(this.allCheckNum == this.productList.length){
				this.checkAllFlag = true;
			}
			this.calcTotalPrice();
		},
		calcTotalPrice: function(){
			this.totalMoney = 0;
			this.productList.forEach((product,index)=>{
				if(product.checked){
					this.totalMoney += product.productQuantity * product.productPrice;
				}
			});
		},
		selectAll: function(){
			if(!this.checkAllFlag){
				this.productList.forEach((item,index)=>{
					if(typeof item.checked == "undefined"){
						this.$set(item,"checked",true);
					}else{
						item.checked = true;
					}
				});
				this.checkAllFlag = true;
			}else{
				this.productList.forEach((item,index)=>{
					if(typeof item.checked == "undefined"){
						this.$set(item,"checked",false);
					}else{
						item.checked = false;
					}
				});
				this.checkAllFlag = false;
			}
			this.calcTotalPrice();
		},
		addNumber: function(item){
			item.productQuantity++;
			this.calcTotalPrice();
		},
		subNumber: function(item){
			if(item.productQuantity>0){
				item.productQuantity--;
				this.calcTotalPrice();
			}
		},
		deletePro: function(){
			this.productList.splice(this.curDeleteIndex,1);
			this.calcTotalPrice();
			this.showModel = false;
		},
		deleteProModel: function(index){
			this.curDeleteIndex = index;
			this.showModel = true;
 		},
 		hiddenModel: function(){
 			this.showModel = false;
 		},
 		checkOut: function(){
 			location.href = './address.html';
 		}
	},
});