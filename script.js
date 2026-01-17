// 1. إعداد قاعدة البيانات والبيانات الأولية
const TopSpeedDB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem('ts_' + key)) || [],
    clear: () => {
        if(confirm("تصفير جميع البيانات؟")) {
            localStorage.clear();
            location.reload();
        }
    }
};

let drivers = TopSpeedDB.load('drivers');
let orders = TopSpeedDB.load('orders');

// 2. نظام اللودر (Loader)
let count = 0;
function updateLoader() {
    const counter = document.getElementById('counter');
    const loader = document.getElementById('loaderWrapper');
    const main = document.getElementById('mainSystem');

    if (count < 100) {
        count += 5;
        if(counter) counter.innerText = count + "%";
        setTimeout(updateLoader, 20);
    } else {
        if(loader) loader.style.display = 'none';
        if(main) main.style.display = 'flex';
        document.body.classList.remove('overflow-hidden');
        renderAll(); // تشغيل العرض فور الدخول
    }
}

// 3. إدارة المناديب
function addNewDriver() {
    const nameEl = document.getElementById('newDriverName');
    const codeEl = document.getElementById('newDriverCode');

    if(!nameEl.value || !codeEl.value) return alert("أكمل بيانات المندوب");

    drivers.push({ name: nameEl.value, code: codeEl.value });
    TopSpeedDB.save('drivers', drivers);
    
    nameEl.value = ''; codeEl.value = '';
    renderAll();
    alert("تم تفعيل المندوب");
}

// 4. إدارة الطلبات
function addNewOrder() {
    const rest = document.getElementById('restName');
    const addr = document.getElementById('orderAddress');
    const price = document.getElementById('orderPrice');
    const dSelect = document.getElementById('driverSelect');

    if(!rest.value || !addr.value || !price.value || !dSelect.value) {
        return alert("أكمل بيانات الأوردر واختار المندوب");
    }

    const newOrder = {
        id: Date.now(),
        rest: rest.value,
        addr: addr.value,
        price: parseFloat(price.value),
        driverName: dSelect.options[dSelect.selectedIndex].text,
        status: 'معلق'
    };

    orders.push(newOrder);
    TopSpeedDB.save('orders', orders);
    
    rest.value = ''; addr.value = ''; price.value = '';
    renderAll();
}

// 5. زر تأكيد التسليم وزر الحذف
function completeOrder(id) {
    const idx = orders.findIndex(o => o.id === id);
    if(idx !== -1) {
        orders[idx].status = 'تم التسليم';
        TopSpeedDB.save('orders', orders);
        renderAll();
    }
}

function deleteOrder(id) {
    if(confirm("حذف الأوردر نهائياً؟")) {
        orders = orders.filter(o => o.id !== id);
        TopSpeedDB.save('orders', orders);
        renderAll();
    }
}

// 6. العرض الشامل (الجدول والرصيد والمناديب)
function renderAll() {
    // تحديث الجدول
    const tableBody = document.getElementById('ordersTableBody');
    if(tableBody) {
        tableBody.innerHTML = orders.map(o => `
            <tr class="border-b bg-white">
                <td class="p-4 font-bold text-slate-800">${o.rest}</td>
                <td class="p-4 text-blue-600 underline text-xs">${o.addr}</td>
                <td class="p-4 font-black">${o.price} EGP</td>
                <td class="p-4 text-sm">${o.driverName}</td>
                <td class="p-4 text-center flex items-center justify-center gap-2">
                    ${o.status === 'تم التسليم' 
                        ? `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black">تم التسليم ✅</span>`
                        : `<button onclick="completeOrder(${o.id})" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-green-600 transition">تأكيد التسليم</button>`
                    }
                    <button onclick="deleteOrder(${o.id})" class="text-red-300 hover:text-red-600"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).reverse().join(''); // عكس الترتيب عشان الجديد يظهر فوق
    }

    // تحديث قائمة المناديب في السليكت (Select)
    const select = document.getElementById('driverSelect');
    if(select) {
        select.innerHTML = '<option value="" disabled selected>اختيار المندوب</option>' + 
            drivers.map(d => `<option value="${d.code}">${d.name}</option>`).join('');
    }

    // تحديث شبكة المناديب (Grid)
    const grid = document.getElementById('driversGrid');
    if(grid) {
        grid.innerHTML = drivers.map(d => `
            <div class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                <b>${d.name} <span class="text-gray-400 text-[10px]">(${d.code})</span></b>
                <i class="fas fa-check-circle text-green-500"></i>
            </div>
        `).join('');
    }

    // تحديث الرصيد (يحسب فقط اللي "تم التسليم")
    const total = orders
        .filter(o => o.status === 'تم التسليم')
        .reduce((sum, o) => sum + o.price, 0);
    
    const incomeEl = document.getElementById('dailyIncome');
    if(incomeEl) incomeEl.innerText = total.toLocaleString();
}

// 7. التنقل بين الأقسام
function showSection(id) {
    document.getElementById('ordersSection').classList.toggle('hidden', id !== 'orders');
    document.getElementById('driversSection').classList.toggle('hidden', id !== 'drivers');
}

// تشغيل النظام
updateLoader();
