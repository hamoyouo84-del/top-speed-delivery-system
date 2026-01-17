// 1. تعريف قاعدة البيانات محلياً داخل الملف لضمان الاستقرار
const TopSpeedDB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => {
        try {
            return JSON.parse(localStorage.getItem('ts_' + key)) || [];
        } catch(e) { return []; }
    },
    clear: () => {
        if(confirm("تصفير جميع البيانات؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

// 2. تحميل البيانات
let drivers = TopSpeedDB.load('drivers');
let orders = TopSpeedDB.load('orders');

// 3. التحكم في شاشة التحميل (Loader)
let count = 0;
const updateLoader = () => {
    const counter = document.getElementById('counter');
    const loader = document.getElementById('loaderWrapper');
    const main = document.getElementById('mainSystem');

    if (count < 100) {
        count += 10;
        if(counter) counter.innerText = count + "%";
        setTimeout(updateLoader, 30);
    } else {
        if(loader) loader.style.display = 'none';
        if(main) {
            main.style.display = 'flex';
            main.style.opacity = '1';
        }
        document.body.classList.remove('overflow-hidden');
        renderAll(); // عرض البيانات فوراً
    }
};

// 4. دالة عرض البيانات (التي كانت تسبب المشكلة)
function renderAll() {
    // أ- تحديث جدول الطلبات
    const tableBody = document.getElementById('ordersTableBody');
    if (tableBody) {
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-slate-400 font-bold">لا توجد طلبات اليوم</td></tr>';
        } else {
            tableBody.innerHTML = orders.map((o, index) => {
                const isDone = o.status === 'تم التسليم';
                return `
                    <tr class="border-b bg-white hover:bg-slate-50 transition">
                        <td class="p-4 font-bold text-slate-800">${o.rest || 'بدون اسم'}</td>
                        <td class="p-4 text-xs">
                            <a href="https://www.google.com/maps/search/${encodeURIComponent(o.addr)}" target="_blank" class="text-blue-500 hover:underline">
                                <i class="fas fa-map-marker-alt ml-1"></i> ${o.addr || 'غير محدد'}
                            </a>
                        </td>
                        <td class="p-4 font-black text-slate-900">${o.price} EGP</td>
                        <td class="p-4 text-sm font-bold text-slate-600">${o.driverName || 'غير محدد'}</td>
                        <td class="p-4 text-center">
                            ${isDone 
                                ? `<span class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-green-200">تم التسليم ✅</span>`
                                : `<button onclick="completeOrder(${o.id})" class="bg-blue-600 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition shadow-sm active:scale-95">تأكيد التسليم</button>`
                            }
                        </td>
                    </tr>
                `;
            }).reverse().join('');
        }
    }

    // ب- تحديث قائمة المناديب (Dropdown)
    const select = document.getElementById('driverSelect');
    if (select) {
        select.innerHTML = '<option value="" disabled selected>اختيار المندوب</option>' + 
            drivers.map(d => `<option value="${d.code}">${d.name}</option>`).join('');
    }

    // ج- تحديث شبكة المناديب (Drivers Grid)
    const grid = document.getElementById('driversGrid');
    if (grid) {
        grid.innerHTML = drivers.length ? drivers.map(d => `
            <div class="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <span class="font-bold text-slate-700">${d.name} <small class="text-slate-400 block text-[10px]">كود: ${d.code}</small></span>
                <i class="fas fa-user-check text-blue-500"></i>
            </div>
        `).join('') : '<p class="text-center text-slate-400 col-span-2">لم يتم إضافة مناديب بعد</p>';
    }

    // د- تحديث الرصيد (يحسب فقط الطلبات المكتملة)
    const total = orders
        .filter(o => o.status === 'تم التسليم')
        .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
    
    const incomeEl = document.getElementById('dailyIncome');
    if (incomeEl) incomeEl.innerText = total.toLocaleString();
}

// 5. إدارة المناديب والطلبات
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

function addNewOrder() {
    const rest = document.getElementById('restName').value;
    const addr = document.getElementById('orderAddress').value;
    const price = document.getElementById('orderPrice').value;
    const dSelect = document.getElementById('driverSelect');

    if(!rest || !addr || !price || !dSelect.value) return alert("أكمل بيانات الطلب");

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
    renderAll();
    
    document.getElementById('restName').value = '';
    document.getElementById('orderAddress').value = '';
    document.getElementById('orderPrice').value = '';
}

function completeOrder(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = 'تم التسليم';
        TopSpeedDB.save('orders', orders);
        renderAll();
    }
}

function showSection(section) {
    document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');
    document.getElementById('driversSection').classList.toggle('hidden', section !== 'drivers');
}

// 6. بدء التشغيل
document.addEventListener('DOMContentLoaded', updateLoader);
