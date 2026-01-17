// 1. إدارة البيانات (Local Storage)
const TopSpeedDB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem('ts_' + key)) || [],
    clear: () => {
        if(confirm("هل تريد تصفير جميع بيانات النظام؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

// 2. تحميل البيانات الأولية
let drivers = TopSpeedDB.load('drivers');
let orders = TopSpeedDB.load('orders');

// 3. تشغيل شاشة التحميل (Loader)
window.onload = () => {
    let count = 0;
    const interval = setInterval(() => {
        count += 5;
        document.getElementById('counter').innerText = count + "%";
        if (count >= 100) {
            clearInterval(interval);
            document.getElementById('loaderWrapper').style.display = 'none';
            document.getElementById('mainSystem').style.display = 'flex';
            document.body.classList.remove('overflow-hidden');
            renderAll(); // عرض البيانات فوراً
        }
    }, 30);
};

// 4. دالة إضافة مندوب
function addNewDriver() {
    const name = document.getElementById('newDriverName').value.trim();
    const code = document.getElementById('newDriverCode').value.trim();

    if(!name || !code) return alert("برجاء إدخال اسم المندوب وكوده");

    drivers.push({ name, code });
    TopSpeedDB.save('drivers', drivers);
    
    document.getElementById('newDriverName').value = '';
    document.getElementById('newDriverCode').value = '';
    renderAll();
    alert("تم تفعيل المندوب بنجاح");
}

// 5. دالة إضافة أوردر
function addNewOrder() {
    const rest = document.getElementById('restName').value.trim();
    const addr = document.getElementById('orderAddress').value.trim();
    const price = document.getElementById('orderPrice').value.trim();
    const dSelect = document.getElementById('driverSelect');

    if(!rest || !addr || !price || !dSelect.value) return alert("أكمل بيانات الأوردر واختار المندوب");

    const newOrder = {
        id: Date.now(),
        rest,
        addr,
        price: parseFloat(price),
        driverName: dSelect.options[dSelect.selectedIndex].text,
        status: 'معلق'
    };

    orders.push(newOrder);
    TopSpeedDB.save('orders', orders);
    
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderPrice').value = '';
    renderAll();
}

// 6. دالة تأكيد التسليم (تغيير الحالة وحساب المبلغ)
function completeOrder(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if(index !== -1) {
        orders[index].status = 'تم التسليم';
        TopSpeedDB.save('orders', orders);
        renderAll();
    }
}

// 7. تحديث الواجهة (الرسم الفعلي للجدول)
function renderAll() {
    // تحديث الجدول
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = orders.map(o => `
        <tr class="border-b bg-white transition hover:bg-slate-50">
            <td class="p-4 font-bold text-slate-800">${o.rest}</td>
            <td class="p-4 text-xs text-blue-600 underline">
                <a href="https://www.google.com/maps/search/${encodeURIComponent(o.addr)}" target="_blank">${o.addr}</a>
            </td>
            <td class="p-4 font-black text-slate-900">${o.price} EGP</td>
            <td class="p-4 text-sm font-bold text-slate-600">${o.driverName}</td>
            <td class="p-4 text-center">
                ${o.status === 'تم التسليم' 
                    ? `<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-green-200">تم التسليم ✅</span>`
                    : `<button onclick="completeOrder(${o.id})" class="bg-blue-600 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition shadow-sm">تأكيد التسليم</button>`
                }
            </td>
        </tr>
    `).reverse().join('');

    // تحديث قائمة المناديب (Dropdown)
    const select = document.getElementById('driverSelect');
    select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>' + 
        drivers.map(d => `<option value="${d.code}">${d.name}</option>`).join('');

    // تحديث شبكة المناديب (Grid)
    const grid = document.getElementById('driversGrid');
    grid.innerHTML = drivers.map(d => `
        <div class="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
            <span class="font-bold text-slate-700">${d.name} <small class="text-slate-400 block text-[10px]">Code: ${d.code}</small></span>
            <i class="fas fa-check-circle text-green-500"></i>
        </div>
    `).join('');

    // تحديث إجمالي الرصيد (الطلبات المسلمة فقط)
    const total = orders
        .filter(o => o.status === 'تم التسليم')
        .reduce((sum, o) => sum + o.price, 0);
    document.getElementById('dailyIncome').innerText = total.toLocaleString();
}

// التنقل بين الصفحات
function showSection(id) {
    document.getElementById('ordersSection').classList.toggle('hidden', id !== 'orders');
    document.getElementById('driversSection').classList.toggle('hidden', id !== 'drivers');
}
