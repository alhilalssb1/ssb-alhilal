// Ganti URL di bawah dengan URL Web App Google Apps Script Anda setelah proses Deploy
const API_URL = "https://script.google.com/macros/s/AKfycbyEyoCPxif1q-sto6yypKnYnMWB51NJd6HDD6EupacYTYRmSdrlbUqWPoUa-19fsX7p_g/exectps://script.google.com/macros/s/AKfycbyA8fz5dBf4A7J0IAS2q4dEGMhttps://script.google.com/macros/s/AKfycbx2UXaaGroUqsIpfNSR32WzB8AGCCD7958R_NIGnXKTGtX6SdkXUFLZw9yMSs7YpVTv8g/exec77P_tfqpN06P_0dX29Fw3pNF-m8FuqUgL8rU4zSV1M8A/execttps://script.google.com/macros/s/AKfycbwxGfSgWTV4WjSRDVE6zlXJbFax5-GtAmk0Lx3z_123MxFbHWDde-Zi_uclKh4tPOHYZg/exec";

let currentUser = JSON.parse(localStorage.getItem("ssb_user")) || null;

document.addEventListener("DOMContentLoaded", () => {
    if (currentUser) {
        showApp();
    } else {
        showLogin();
    }
});

function showLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
}

function showApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("user-welcome-name").innerText = currentUser.username;
    document.getElementById("user-role-badge").innerText = currentUser.peran;
    
    // Kontrol Hak Akses Tampilan (UI Role Restriction)
    const btnTambahPemain = document.getElementById("btn-tambah-pemain");
    if (btnTambahPemain) {
        if (currentUser.peran === "ADMIN") {
            btnTambahPemain.classList.remove("hidden");
        } else {
            btnTambahPemain.classList.add("hidden"); // Sembunyikan dari Pelatih & Ortu
        }
    }
    
    loadDashboardData();
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");
    const btn = document.getElementById("login-btn");

    errorEl.classList.add("hidden");
    btn.innerText = "Memproses...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "login",
                payload: { username, password }
            })
        });
        const result = await response.json();

        if (result.status === "success") {
            currentUser = result.user;
            localStorage.setItem("ssb_user", JSON.stringify(currentUser));
            showApp();
        } else {
            errorEl.innerText = result.message;
            errorEl.classList.remove("hidden");
        }
    } catch (err) {
        errorEl.innerText = "Gagal terhubung ke server backend.";
        errorEl.classList.remove("hidden");
    } finally {
        btn.innerText = "Masuk Aplikasi";
    }
}

function handleLogout() {
    localStorage.removeItem("ssb_user");
    currentUser = null;
    showLogin();
}

function switchTab(tabName) {
    const tabs = ["dashboard", "pemain", "absensi", "jadwal", "penilaian"];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) el.classList.add("hidden");
    });
    
    const activeEl = document.getElementById(`tab-${tabName}`);
    if (activeEl) activeEl.classList.remove("hidden");

    if (tabName === "pemain") loadPemainData();
    if (tabName === "jadwal") loadJadwalData();
}

async function loadDashboardData() {
    try {
        const res = await fetch(`${API_URL}?action=getPemain`);
        const json = await res.json();
        if (json.status === "success") {
            const pemainList = json.data;
            document.getElementById("stat-total-pemain").innerText = pemainList.length;
            document.getElementById("stat-total-kelompok").innerText = "4"; // Contoh dinamis
        }
    } catch (err) {
        console.error("Gagal memuat dashboard", err);
    }
}

async function loadPemainData() {
    const tbody = document.getElementById("pemain-table-body");
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">Memuat data...</td></tr>`;

    try {
        const res = await fetch(`${API_URL}?action=getPemain`);
        const json = await res.json();
        if (json.status === "success" && json.data.length > 0) {
            tbody.innerHTML = json.data.map(p => `
                <tr class="hover:bg-gray-750 transition">
                    <td class="p-4 font-mono text-blue-400">${p.nia || '-'}</td>
                    <td class="p-4 font-semibold text-white">${p.nama_lengkap || '-'}</td>
                    <td class="p-4 text-gray-300">${p.posisi_utama || '-'}</td>
                    <td class="p-4 text-gray-300">${p.id_kelompok || '-'}</td>
                    <td class="p-4 text-gray-300">${p.no_telp_ortu || '-'}</td>
                    <td class="p-4"><span class="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">${p.status_aktif || 'Aktif'}</span></td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">Belum ada data pemain.</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-400">Gagal mengambil data.</td></tr>`;
    }
}

async function loadJadwalData() {
    const container = document.getElementById("jadwal-list");
    container.innerHTML = `<p class="text-gray-400">Memuat jadwal...</p>`;
    try {
        const res = await fetch(`${API_URL}?action=getJadwal`);
        const json = await res.json();
        if (json.status === "success" && json.data.length > 0) {
            container.innerHTML = json.data.map(j => `
                <div class="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                    <div>
                        <span class="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded">${j.jenis_kegiatan}</span>
                        <h4 class="font-bold text-white mt-1">${j.lokasi}</h4>
                        <p class="text-xs text-gray-400 mt-1">${j.tanggal} | ${j.jam_mulai} - ${j.jam_selesai}</p>
                    </div>
                    <span class="text-xs font-semibold text-green-400">${j.status_kegiatan}</span>
                </div>
            `).join("");
        } else {
            container.innerHTML = `<p class="text-gray-400">Belum ada jadwal kegiatan.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<p class="text-red-400">Gagal memuat jadwal.</p>`;
    }
}

async function submitAbsensiManual() {
    const nia = document.getElementById("input-nia-absensi").value;
    const msg = document.getElementById("absensi-status-msg");
    if (!nia) {
        msg.innerText = "Masukkan NIA terlebih dahulu.";
        msg.className = "mt-3 text-sm text-red-400";
        return;
    }

    msg.innerText = "Menyimpan absensi...";
    msg.className = "mt-3 text-sm text-yellow-400";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "addAbsensi",
                payload: {
                    id_pemain: nia,
                    tanggal: new Date().toISOString().split('T')[0],
                    jenis_sesi: "Datang",
                    waktu_catat: new Date().toLocaleString(),
                    status_kehadiran: "Hadir",
                    metode_pencatatan: "Manual Input",
                    pencatat: currentUser.username
                }
            })
        });
        const result = await res.json();
        if (result.status === "success") {
            msg.innerText = "Berhasil mencatat kehadiran pemain!";
            msg.className = "mt-3 text-sm text-green-400";
            document.getElementById("input-nia-absensi").value = "";
        } else {
            msg.innerText = result.message;
            msg.className = "mt-3 text-sm text-red-400";
        }
    } catch (err) {
        msg.innerText = "Kesalahan koneksi ke server.";
        msg.className = "mt-3 text-sm text-red-400";
    }
}
