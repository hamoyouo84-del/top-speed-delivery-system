// --- 1. إعدادات قاعدة البيانات المحلية (Local Storage) ---
// وضعناها هنا مباشرة لضمان أن الزر يجدها دائماً
const DB = {
    save: (key, data) => localStorage.setItem('ts_' + key, JSON.stringify(data)),
    load: (key) => {
        const data = localStorage.getItem('ts_' + key);
        return data ? JSON.parse(data) : [];
    }
};

// --- 2. متغيرات النظام ---
let drivers = DB.load('drivers');
let orders = DB.load('orders');
let totalIncome = parseFloat(localStorage.getItem('ts_total')) || 0;

// --- 3. نظام التحميل (Loader) ---
let count = 0;
function updateLoader() {
    const counter = document.getElementById('counter');
    const loader = document.getElementById('loaderWrapper');
    const main = document.getElementById('mainSystem');

    if (count < 100) {
        count += 5;
        if(counter) counter.innerText = count + "%";
        setTimeout(updateLoader, 30);
    } else {
        if(loader) loader.style.display = 'none';
        if(main) main.style.display = 'flex';
        document.body.classList.remove('overflow-hidden');
    }
}

// --- 4. دالة إضافة مندوب جديد (التي كانت لا تعمل) ---
function addNewDriver() {
    const nameInput = document.getElementById('newDriverName');
    const codeInput = document.getElementById('newDriverCode');

    // التأكد من أن العناصر موجودة والقيم ليست فارغة
    if (!nameInput || !codeInput || !nameInput.value.trim() || !codeInput.value.trim()) {
        alert("من فضلك ادخل اسم المندوب وكوده!");
        return;
    }

    const newDriver = {
        name: nameInput.value.trim(),
        code: codeInput.value.trim()
    };

    // إضافة للذاكرة
    drivers.push(newDriver);
    DB.save('drivers', drivers);

    // تحديث الواجهة
    updateDriverUI();
    
    // مسح الخانات وتنبيه النجاح
    nameInput.value = '';
    codeInput.value = '';
    alert("✅ تم تفعيل المندوب بنجاح!");
}

// تحديث عرض المناديب في الجدول والقائمة المنسدلة
function updateDriverUI() {
    const grid = document.getElementById('driversGrid');
    const select = document.getElementById('driverSelect');
    
    if (grid) grid.innerHTML = '';
    if (select) select.innerHTML = '<option value="" disabled selected>-- اختر المندوب --</option>';

    drivers.forEach((d, index) => {
        // إضافة لشبكة المناديب
        if (grid) {
            grid.innerHTML += `
                <div class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                    <div>
                        <p class="font-bold text-slate-800">${d.name}</p>
                        <p class="text-xs text-slate-400">كود: ${d.code}</p>
                    </div>
                    <button onclick="deleteDriver(${index})" class="text-red-400 hover:text-red-600 p-2">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>`;
        }
        // إضافة للقائمة المنسدلة في صفحة الطلبات
        if (select) {
            const opt = document.createElement('option');
            opt.value = d.code;
            opt.innerText = d.name;
            select.appendChild(opt);
        }
    });
}

function deleteDriver(index) {
    if (confirm("هل تريد حذف هذا المندوب؟")) {
        drivers.splice(index, 1);
        DB.save('drivers', drivers);
        updateDriverUI();
    }
}

// --- 5. نظام الطلبات (Orders) ---
function addNewOrder() {
    const rest = document.getElementById('restName');
    const addr = document.getElementById('orderAddress');
    const price = document.getElementById('orderPrice');
    const dSelect = document.getElementById('driverSelect');

    if (!rest.value || !addr.value || !price.value || !dSelect.value) {
        alert("برجاء إكمال بيانات الطلب!");
        return;
    }

    const order = {
        id: Date.now(),
        rest: rest.value,
        addr: addr.value,
        price: parseFloat(price.value),
        driverCode: dSelect.value,
        driverName: dSelect.options[dSelect.selectedIndex].text,
        status: 'معلق'
    };

    orders.push(order);
    DB.save('orders', orders);

    totalIncome += order.price;
    localStorage.setItem('ts_total', totalIncome);
    
    renderOrders();
    updateIncomeUI();

    // تصفير الخانات
    rest.value = ''; addr.value = ''; price.value = '';
}

function renderOrders() {
    const body = document.getElementById('ordersTableBody');
    if (!body) return;
    body.innerHTML = '';

    orders.forEach(o => {
        const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(o.addr)}`;
        body.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition text-sm">
                <td class="p-4 font-bold">${o.rest}</td>
                <td class="p-4">
                    <a href="${mapUrl}" target="_blank" class="text-blue-500 underline">
                        <i class="fas fa-map-marker-alt"></i> ${o.addr}
                    </a>
                </td>
                <td class="p-4 font-bold text-blue-600">${o.price} EGP</td>
                <td class="p-4 font-bold">${o.driverName}</td>
                <td class="p-4 text-center">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black status-pending">${o.status}</span>
                </td>
            </tr>`;
    });
}

function updateIncomeUI() {
    const el = document.getElementById('dailyIncome');
    if (el) el.innerText = totalIncome.toLocaleString();
}

// --- 6. التنقل وتشغيل النظام ---
function showSection(id) {
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('driversSection').classList.add('hidden');
    document.getElementById(id + 'Section').classList.remove('hidden');
}

window.onload = () => {
    updateLoader();
    updateDriverUI();
    renderOrders();
    updateIncomeUI();
};
