// مصفوفة لتخزين الأوردرات
let orders = [];
let dailyTotal = 0;

// إضافة أوردر جديد
function addNewOrder() {
    const rest = document.getElementById('restName').value;
    const priceInput = document.getElementById('orderPrice').value;
    const driverData = document.getElementById('driverSelect').value.split('|');

    if(!rest || !priceInput) {
        alert("برجاء إدخال اسم المطعم والسعر!");
        return;
    }

    const newOrder = {
        id: Date.now(),
        rest: rest,
        price: parseFloat(priceInput),
        driverCode: driverData[0],
        driverName: driverData[1],
        status: 'pending' // الحالات: pending, moving, delivered
    };

    orders.push(newOrder);
    renderOrders();
    
    // تصفير الحقول
    document.getElementById('restName').value = '';
    document.getElementById('orderPrice').value = '';
}

// تحديث حالة الأوردر
function updateStatus(id, nextStatus) {
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return;

    orders[orderIndex].status = nextStatus;
    
    // إذا تم التسليم، يضاف السعر لليومية
    if(nextStatus === 'delivered') {
        dailyTotal += orders[orderIndex].price;
        document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString() + " ج.م";
    }
    renderOrders();
}

// حذف أوردر
function deleteOrder(id) {
    if(confirm('هل أنت متأكد من حذف هذا الأوردر؟')) {
        const order = orders.find(o => o.id === id);
        // إذا كان تم تسليمه، يتم خصمه من اليومية عند الحذف
        if(order.status === 'delivered') {
            dailyTotal -= order.price;
            document.getElementById('dailyIncome').innerText = dailyTotal.toLocaleString() + " ج.م";
        }
        orders = orders.filter(o => o.id !== id);
        renderOrders();
    }
}

// عرض البيانات في الجدول
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    orders.forEach(order => {
        let statusBadge = '';
        let actionBtn = '';

        if(order.status === 'pending') {
            statusBadge = '<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">معلق</span>';
            actionBtn = `<button onclick="updateStatus(${order.id}, 'moving')" class="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600 ml-2">تم التحرك</button>`;
        } else if(order.status === 'moving') {
            statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">في الطريق</span>';
            actionBtn = `<button onclick="updateStatus(${order.id}, 'delivered')" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 ml-2">تم التسليم</button>`;
        } else {
            statusBadge = '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono">تم التسليم ✓</span>';
            actionBtn = `<span class="text-gray-400 text-xs italic ml-2 font-bold">مكتمل</span>`;
        }

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition ${order.status === 'delivered' ? 'bg-green-50/30' : ''}">
                <td class="p-4 font-bold text-slate-700">${order.rest}</td>
                <td class="p-4 text-blue-800 font-bold font-mono">${order.price.toLocaleString()} ج.م</td>
                <td class="p-4">
                    <span class="block font-bold text-sm">${order.driverName}</span>
                    <span class="text-[10px] text-blue-600 font-mono">${order.driverCode}</span>
                </td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-center">
                    ${actionBtn}
                    <button onclick="deleteOrder(${order.id})" class="text-red-400 hover:text-red-600 text-xs mr-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// التنقل بين الأقسام
function showSection(section) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    
    if(section === 'orders') document.getElementById('ordersSection').classList.remove('hidden');
    if(section === 'drivers') document.getElementById('driversSection').classList.remove('hidden');
}

