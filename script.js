// 1. نظام قاعدة البيانات المصغر
const TopSpeedDB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem('ts_' + key)) || [],
    clear: () => {
        if(confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

// 2. المتغيرات الأساسية
let drivers = TopSpeedDB.load('drivers');
let orders = TopSpeedDB.load('orders');

// 3. وظيفة شاشة التحميل
let count = 0;
const counter = document.getElementById('counter');
const loader = document.getElementById('loaderWrapper');
const main = document.getElementById('mainSystem');

function updateLoader() {
    if (count < 100) {
        count += 5;
        counter.innerText = count + "%";
        setTimeout(updateLoader, 20);
    } else {
        loader.style.display = 'none';
        main.style.display = 'flex';
        renderAll();
    }
}
updateLoader();

// 4. إدارة المناديب
function addNewDriver() {
    const name = document.getElementById('newDriverName').value;
    const code = document.getElementById('newDriverCode').value;
    if(!name || !code) return alert("أدخل بيانات المندوب كاملة");
    drivers.push({ name, code });
    TopSpeedDB.save('drivers', drivers);
    renderAll();
    document.getElementById('newDriverName').value = '';
    document.getElementById('newDriverCode').value = '';
}

// 5. إدارة الطلبات
function addNewOrder() {
    const rest = document.getElementById('restName').value;
    const addr = document.getElementById('orderAddress').value;
    const price = document.getElementById('orderPrice').value;
    const driverCode = document.getElementById('driverSelect').value;

    if(!rest || !addr || !price || !driverCode) return alert("أكمل بيانات الطلب");

    const driver = drivers.find(d => d.code === driverCode);
    
    const newOrder = {
        id: Date.now(),
        rest,
        addr,
        price: parseFloat(price),
        driverName: driver.name,
        status: 'معلق' // الحالة الافتراضية
    };

    orders.push(newOrder);
    TopSpeedDB.save('orders', orders);
    renderAll();
    
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderPrice').value = '';
}

// 6. دالة تغيير الحالة وحساب الرصيد (الميزة الجديدة)
function completeOrder(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = 'تم التسليم';
        TopSpeedDB.save('orders', orders);
        renderAll(); // سيقوم بتحديث الرصيد تلقائياً
    }
}

// 7. التحديث الشامل للواجهة
function renderAll() {
    // تحديث جدول الطلبات
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = orders.map(o => {
        const isDone = o.status === 'تم التسليم';
        return `
            <tr class="border-b transition hover:bg-slate-50">
                <td class="p-4 font-bold text-slate-700">${o.rest}</td>
                <td class="p-4 text-xs">
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(o.addr)}" target="_blank" class="text-blue-500 hover:underline">
                        <i class="fas fa-map-marker-alt ml-1"></i> ${o.addr}
                    </a>
                </td>
                <td class="p-4 font-black text-slate-900">${o.price} EGP</td>
                <td class="p-4 text-sm font-bold text-slate-600">${o.driverName}</td>
                <td class="p-4 text-center">
                    ${isDone 
                        ? `<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-green-200">
                             تم التسليم <i class="fas fa-check-circle mr-1"></i>
                           </span>`
                        : `<button onclick="completeOrder(${o.id})" class="bg-blue-600 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-sm active:scale-95">
                             تأكيد التسليم
                           </button>`
                    }
                </td>
            </tr>
        `;
    }).join('');

    // تحديث قائمة اختيار المندوب
    const select = document.getElementById('driverSelect');
    select.innerHTML = '<option value="" disabled selected>اختيار المندوب</option>' + 
        drivers.map(d => `<option value="${d.code}">${d.name}</option>`).join('');

    // تحديث قائمة المناديب
    const grid = document.getElementById('driversGrid');
    grid.innerHTML = drivers.map(d => `
        <div class="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
            <span class="font-bold text-slate-700">${d.name} <small class="text-slate-400 block text-[10px]">كود: ${d.code}</small></span>
            <i class="fas fa-user-check text-blue-500"></i>
        </div>
    `).join('');

    // تحديث إجمالي المحصل (يحسب فقط الطلبات التي حالتها "تم التسليم")
    const total = orders
        .filter(o => o.status === 'تم التسليم')
        .reduce((sum, o) => sum + o.price, 0);
    
    document.getElementById('dailyIncome').innerText = total.toLocaleString();
}

// التنقل بين الأقسام
function showSection(section) {
    document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');
    document.getElementById('driversSection').classList.toggle('hidden', section !== 'drivers');
}
