// 圖表Lv1
// function renderC3(){
//   // 物件資料關聯 {收納: 1890, 床架: 31560}
//   let total = {};
//   orderData.forEach(function(item){
//     item.products.forEach(function(productItem){
//       if (total[productItem.category] === undefined) {
//         total[productItem.category] = productItem.price * productItem.quantity;
//       }else {
//         total[productItem.category] += productItem.price * productItem.quantity;
//       }
//     })
//   })
//   // 資料關聯
//   // ['收納', '床架']
//   let arrayData = Object.keys(total);
//   // [['收納', 1350], ['床架', 23300]]
//   let newData = [];
//   arrayData.forEach(function(item){
//     let arr = [];
//     arr.push(item);
//     arr.push(total[item]);
//     newData.push(arr);
//   })

//   // C3.js
//   let chart = c3.generate({
//     bindto: '#chart', // HTML 元素綁定
//     data: {
//         type: "pie",
//         columns: newData,
//         colors:{
//             "床架":"#DACBFF",
//             "收納":"#9D7FEA",
//             "窗簾": "#5434A7",
//         }
//     },
//   });
// }

// 圖表LV2
function renderC3(){
  // 物件資料關聯 {Antony 床邊桌: 1890, Antony 遮光窗簾: 31560}
  let total = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if (total[productItem.title] === undefined) {
        total[productItem.title] = productItem.price * productItem.quantity;
      }else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    })
  })

  // 資料關聯
  // ['Antony 床邊桌', 'Antony 遮光窗簾']
  let arrayData = Object.keys(total);
  // // [['Antony 床邊桌', 1350], ['Antony 遮光窗簾', 23300]]
  let newData = [];
  arrayData.forEach(function(item){
    let arr = [];
    arr.push(item);
    arr.push(total[item]);
    newData.push(arr);
  })

  // sort 排序由大到小
  newData.sort(function(a, b){
    return b[1] - a[1];
  })

  // 如果超過4筆資料，統整為其他
  if (newData.length > 3) {
    let total = 0;
    newData.forEach(function(item, index){
      if (index > 2) {
        total += item[1];
      }
    })
    newData.splice(3, newData.length - 1);
    newData.push(["其他", total]);
  }

  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        colors:{
            "Charles 雙人床架":"#000000",
            "Jordan 雙人床架／雙人加大":"#6A33F8",
            "Louvre 雙人床架／雙人加大": "#9D7FEA",
            "Louvre 單人床架": "#DACBFF",
            "Antony 遮光窗簾": "#301E5F",
            "Antony 床邊桌": "#5434A7",
            "Antony 雙人床架／雙人加大": "#0067CE",
            "Charles 系列儲物組合": "#C44021",
        }
    },
  });
}

// 後台初始化
function init(){
  getOrderList();
}
init();

// 取得訂單列表
let orderData = [];
function getOrderList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers: {
      'Authorization': token
    }
  })
    .then(function(response){
      orderData = response.data.orders;
      renderOrderList(orderData);
    })
    .catch(function(errors){
      Swal.fire({
        icon: 'error',
        title: '糟糕了...',
        text: "API 路徑可能發生問題...",
      })
    })
}

// 渲染訂單畫面列表
const orderList = document.querySelector(".orderList");
function renderOrderList(data){

  let str = "";

  data.forEach(function(item){
    // 組時間字串
    const timeStamp = new Date(item.createdAt * 1000);
    const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

    // 組產品字串
    let product = "";
    item.products.forEach(function(productItem){
      product += `<p>${productItem.title}x${productItem.quantity}`;
    })

      // 判斷訂單狀態
    let orderStatus = "";
    if (item.paid == false) {
      orderStatus = "未處理";
    }else {
      orderStatus = "已處理";
    }


    str += `<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${product}</p>
              </td>
              <td>${orderTime}</td>
              <td class="orderStatus">
                <a href="#" class="statusBtn" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
              </td>
            </tr>`
  })
  orderList.innerHTML = str;
  renderC3();
}

// 修改訂單狀態
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  let orderStatus = e.target.getAttribute("data-status");
  let orderId = e.target.getAttribute("data-id");
  let orderClass = e.target.getAttribute("class");

  if (orderClass === null) {
    return;
  }
  if (orderClass === "delSingleOrder-Btn") {
    Swal.fire({
      icon: 'warning',
      title: '單筆訂單已刪除',
    })
    deleteOrderItem(orderId);
  }else if (orderClass === "statusBtn") {
    Swal.fire({
      icon: 'success',
      title: '訂單狀態已變更',
    })
    putOrderItem(orderId, orderStatus);
  }
  
  
})

function putOrderItem(id, status){
  // 轉換狀態字串
  let newStatus;
  if (status == "true"){
    newStatus = false;
  }else{
    newStatus = true;
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": id,
        "paid": newStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      getOrderList();
    })
}

// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers: {
      'Authorization': token
    }
  })
    .then(function(response){
      let message = response.data.message;
      alert(`提提示: ${message}`);
      getOrderList();
    })
    .catch(function(errprs){
      let message = errprs.response.data.message;
      // alert(`錯誤訊息: ${message}`);
      Swal.fire({
        icon: 'error',
        title: '錯誤...',
        text: message,
      })
    })
})

// 刪除特定訂單
function deleteOrderItem(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
    headers: {
      'Authorization': token
    }
  })
    .then(function(response){
      getOrderList();
    })
}