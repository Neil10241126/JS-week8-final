// 代入自己的路徑
const api_path = "neil2022";
const token = "UU8uYu576YZ4nRacCAKqcxCwKEz1";

// 預設載入函式
function init(){
  getProductList();
  getCartList();
}
init();

// 取得產品列表
let productData = [];
const productList = document.querySelector(".productWrap");
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
      productData = response.data.products;
      renderProcudtList(productData);
    })

}

// 渲染產品列表畫面
function renderProcudtList(data){
  let str = "";
  data.forEach(function(item){
    str += combineHTML(item);
  })
  productList.innerHTML = str;
}

// 組產品字串
function combineHTML(item){
  return `<li class="productCard">
            <h4 class="productType">${item.category}</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`;
}

// 產品列表篩選器
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  let category = e.target.value;
  if (category === "全部") {
    getProductList();
  }
  let str = "";
  productData.forEach(function(item){
    if (category === item.category) {
      str += combineHTML(item);
    }
  })
  productList.innerHTML = str;
})


// 加入購物車
productList.addEventListener("click", (e) => {
  e.preventDefault();
  const productId = e.target.getAttribute("data-id");
  const cartBtnClass = e.target.getAttribute("class");
  if (cartBtnClass !== "addCardBtn") {
    return;
  }
  let numCheck = 1;
  cartData.forEach(function(item){
    if (item.product.id === productId) {
      numCheck = item.quantity+=1;
    }
  })

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  })
  .then(function(response){
    alert("加入購物車");
    getCartList();
  })
  
})


// 取得購物車列表
let cartData = [];
const cartList = document.querySelector(".cartList");
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
      cartData = response.data.carts;
      const total = document.querySelector(".total");
      let sumTotal = response.data.finalTotal;
      
      let str = "";
      cartData.forEach(function(item){
        str += `<tr>
                  <td>
                      <div class="cardItem-title">
                          <img src="${item.product.images}" alt="">
                          <p>${item.product.title}</p>
                      </div>
                  </td>
                  <td>NT$${toThousands(item.product.price)}</td>
                  <td>${item.quantity}</td>
                  <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                  <td class="discardBtn">
                      <a href="#" class="material-icons" data-id="${item.id}">clear</a>
                  </td>
                </tr>`
      })
      cartList.innerHTML = str;
      total.textContent = `NT$${toThousands(sumTotal)}`;
    })
}


// 清除購物車內全部產品
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
      let status = response.status;
      let message = response.data.message;
      alert(`狀態: ${status}\n訊息: ${message}`);
      getCartList();
    })
    .catch(function(errors){
      let status = errors.response.status;
      let message = errors.response.data.message;
      Swal.fire({
        icon: 'error',
        title: `狀態: ${status}`,
        text: `訊息: ${message}`,
      })
    })
})

// 刪除購物車內特定產品
cartList.addEventListener("click", (e) => {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId === null) {
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
      alert("單筆購物車已刪除");
      getCartList();
    })
})

// 送出購買訂單
const creatOrderBtn = document.querySelector(".orderInfo-btn");
creatOrderBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const form = document.querySelector(".orderInfo-form");
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  
  if (customerName === "" ||
      customerPhone === "" ||
      customerEmail === "" ||
      customerAddress === "" ||
      tradeWay === "")
    {
    Swal.fire({
      icon: 'question',
      title: "個人資料不可為空!"
    })
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  })
    .then(function(response){
      alert("訂單建立成功");
      form.reset();
    })
    .catch(function(errors){
      let status = errors.response.status;
      let message = errors.response.data.message;
      alert(`狀態: ${status}\n訊息: ${message}`);
    })
})


// util js
// 轉換千分位 js
function toThousands(num){
  var parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// validate js 驗證器
const inputs = document.querySelectorAll("input[type=text], input[type=tel], input[type=email]");
const form = document.querySelector(".orderInfo-form");

// 建立驗證規則
let constraints = {
  姓名: {
    presence: {message: "必填!"}
  },
  電話: {
    presence: {message: "必填!"},
    format: {
      pattern: /^[09]{2}\d{8}$/,
      message: "不是標準格式",
    }
  },
  Email: {
    presence: {message: "必填!"},
    email: {message: "不是標準格式!"}
  },
  寄送地址: {
    presence: {message: "必填!"}
  },
}

// 組合驗證邏輯
inputs.forEach((item) => {

  item.addEventListener('change', function(e){

    item.nextElementSibling.textContent = "";
    let errors = validate(form, constraints);

    if(errors){
      Object.keys(errors).forEach(function(keys){
        // console.log(keys);
        document.querySelector(`.${keys}`).textContent = errors[keys]
      })
    }
  })
})
