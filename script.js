// ╔══════════════════════════════════════════════════════════════╗
// ║           KONFIGURASI SUPABASE — ISI BAGIAN INI             ║
// ║  Dapatkan dari: supabase.com → Project → Settings → API    ║
// ╚══════════════════════════════════════════════════════════════╝
const SUPABASE_URL = '';  // ← ganti ini
const SUPABASE_KEY = '';  // ← ganti ini (anon public key)

// ==========================================
// HELPER: Kirim request ke Supabase REST API
// ==========================================
async function supabaseFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : ''
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/' + endpoint, options);
        if (!res.ok) {
            const err = await res.json();
            console.error('Supabase error:', err);
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return null;
    }
}

// ==========================================
// 1. BACA NAMA TAMU DARI URL (?to=Nama+Tamu)
// ==========================================
const parameterURL = new URLSearchParams(window.location.search);
const namaTamu = parameterURL.get('to');

if (namaTamu) {
    document.getElementById('nama-tamu-di-cover').innerText =
        decodeURIComponent(namaTamu.replace(/\+/g, ' '));
}

// ==========================================
// 2. VARIABEL MEMORI MUSIK
// ==========================================
let waktuPutarTerakhir = 0;
const namaFileMusik = 'musik.mp3';

// ==========================================
// 3. TOMBOL BUKA UNDANGAN & AUDIO
// ==========================================
document.getElementById('tombol-buka').addEventListener('click', function () {
    const lagu = document.getElementById('audio-wedding');
    lagu.play().catch(e => console.log('Autoplay tertahan browser:', e));

    document.getElementById('cover-undangan').classList.add('fade-out');
    document.getElementById('konten-utama').classList.remove('hidden');
    document.body.style.overflow = 'auto';

    mulaiCountdown();
    muatUcapan(); // Muat ucapan dari Supabase saat undangan dibuka
});

// ==========================================
// 4. ANIMASI SCROLL REVEAL
// ==========================================
const pengintaiAnimasi = new IntersectionObserver((daftarElemen) => {
    daftarElemen.forEach((isiElemen) => {
        if (isiElemen.isIntersecting) {
            isiElemen.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(bagian => {
    pengintaiAnimasi.observe(bagian);
});

// ==========================================
// 5. MUSIK — HILANGKAN NOTIFIKASI DI HP
// ==========================================
document.addEventListener('visibilitychange', function () {
    const lagu = document.getElementById('audio-wedding');
    const kontenUtama = document.getElementById('konten-utama');
    const sudahBuka = !kontenUtama.classList.contains('hidden');

    if (document.hidden) {
        if (sudahBuka && !lagu.paused) {
            waktuPutarTerakhir = lagu.currentTime;
            lagu.src = '';
            lagu.load();
        }
    } else {
        if (sudahBuka && waktuPutarTerakhir > 0) {
            lagu.src = namaFileMusik;
            lagu.load();
            lagu.currentTime = waktuPutarTerakhir;
            lagu.play().catch(e => console.log('Resume musik gagal:', e));
        }
    }
});

// ==========================================
// 6. COUNTDOWN TIMER
// ==========================================
function mulaiCountdown() {
    // Format: new Date(TAHUN, BULAN-1, TANGGAL, JAM, MENIT, DETIK)
    // Bulan dimulai 0 = Januari. Juni = 5
    const tanggalPernikahan = new Date(2026, 5, 6, 9, 0, 0);

    function updateCountdown() {
        const selisih = tanggalPernikahan - new Date();

        if (selisih <= 0) {
            ['cd-hari', 'cd-jam', 'cd-menit', 'cd-detik'].forEach(id => {
                document.getElementById(id).innerText = '00';
            });
            return;
        }

        const hari  = Math.floor(selisih / (1000 * 60 * 60 * 24));
        const jam   = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
        const detik = Math.floor((selisih % (1000 * 60)) / 1000);

        document.getElementById('cd-hari').innerText  = String(hari).padStart(2, '0');
        document.getElementById('cd-jam').innerText   = String(jam).padStart(2, '0');
        document.getElementById('cd-menit').innerText = String(menit).padStart(2, '0');
        document.getElementById('cd-detik').innerText = String(detik).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ==========================================
// 7. SALIN NOMOR REKENING
// ==========================================
function salinRekening(idElemen, tombol) {
    const nomor = document.getElementById(idElemen).innerText;

    const lakukan = () => {
        tombol.innerText = '✅ Tersalin!';
        tombol.classList.add('tersalin');
        setTimeout(() => {
            tombol.innerText = '📋 Salin Nomor';
            tombol.classList.remove('tersalin');
        }, 2500);
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(nomor).then(lakukan).catch(() => salinFallback(nomor, lakukan));
    } else {
        salinFallback(nomor, lakukan);
    }
}

function salinFallback(teks, callback) {
    const el = document.createElement('textarea');
    el.value = teks;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(el);
    callback();
}

// ==========================================
// 8. UCAPAN & RSVP — TERHUBUNG SUPABASE
// ==========================================

// --- Tampilkan kartu ucapan di halaman ---
function renderKartu(item) {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-ucapan';

    const peta = {
        'Hadir':       { kelas: 'hadir', label: '✅ Hadir' },
        'Masih Ragu':  { kelas: 'ragu',  label: '🤔 Masih Ragu' },
        'Tidak Hadir': { kelas: 'tidak', label: '❌ Tidak Hadir' }
    };
    const info = peta[item.kehadiran] || null;

    // Format waktu kirim
    const tgl = new Date(item.created_at);
    const waktu = isNaN(tgl) ? '' : tgl.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    kartu.innerHTML = `
        <div class="kartu-ucapan-header">
            <span class="nama-pengirim">${escapeHTML(item.nama)}</span>
            ${info ? `<span class="status-hadir ${info.kelas}">${info.label}</span>` : ''}
        </div>
        <p class="isi-ucapan">${escapeHTML(item.ucapan)}</p>
        ${waktu ? `<p class="waktu-ucapan">🕐 ${waktu}</p>` : ''}
    `;
    return kartu;
}

// Escape HTML untuk keamanan (cegah XSS)
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// --- Muat semua ucapan dari Supabase ---
async function muatUcapan() {
    const kontainer = document.getElementById('daftar-ucapan');
    kontainer.innerHTML = '<p class="ucapan-loading">Memuat ucapan... 💌</p>';

    const data = await supabaseFetch('ucapan?select=*&order=created_at.desc&limit=50');

    kontainer.innerHTML = '';

    if (!data || data.length === 0) {
        kontainer.innerHTML = '<p class="ucapan-kosong">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
        return;
    }

    data.forEach(item => kontainer.appendChild(renderKartu(item)));
}

// --- Kirim ucapan baru ke Supabase ---
async function kirimUcapan() {
    const nama      = document.getElementById('input-nama').value.trim();
    const ucapan    = document.getElementById('input-ucapan').value.trim();
    const kehadiran = document.querySelector('input[name="kehadiran"]:checked');
    const tombol    = document.getElementById('tombol-kirim-ucapan');

    // Validasi
    if (!nama)   { tampilkanPesan('⚠️ Mohon isi nama Anda terlebih dahulu 😊', 'error'); return; }
    if (!ucapan) { tampilkanPesan('⚠️ Mohon tuliskan ucapan atau doa Anda 💌', 'error'); return; }
    if (!kehadiran) { tampilkanPesan('⚠️ Mohon pilih konfirmasi kehadiran Anda', 'error'); return; }

    // Nonaktifkan tombol & tampilkan loading
    tombol.disabled = true;
    tombol.innerText = '⏳ Mengirim...';

    const hasil = await supabaseFetch('ucapan', 'POST', {
        nama:      nama,
        ucapan:    ucapan,
        kehadiran: kehadiran.value
    });

    if (hasil && Array.isArray(hasil) && hasil[0] && hasil[0].id) {
        // Berhasil
        document.getElementById('input-nama').value = '';
        document.getElementById('input-ucapan').value = '';
        kehadiran.checked = false;

        tombol.innerText = '✅ Ucapan Terkirim!';
        tampilkanPesan('💌 Ucapan Anda telah terkirim, terima kasih!', 'sukses');

        setTimeout(() => {
            tombol.disabled = false;
            tombol.innerText = '💌 Kirim';
        }, 3000);

        // Tambahkan kartu baru di paling atas tanpa reload semua
        const kontainer = document.getElementById('daftar-ucapan');
        const pesanKosong = kontainer.querySelector('.ucapan-kosong');
        if (pesanKosong) pesanKosong.remove();
        kontainer.insertBefore(renderKartu(hasil[0]), kontainer.firstChild);

    } else {
        // Gagal
        tombol.disabled = false;
        tombol.innerText = '💌 Kirim';
        tampilkanPesan('❌ Gagal mengirim ucapan, silakan coba lagi 🙏', 'error');
    }
}

// --- Tampilkan pesan notifikasi sementara di bawah form ---
function tampilkanPesan(teks, tipe) {
    let el = document.getElementById('notif-ucapan');
    if (!el) {
        el = document.createElement('p');
        el.id = 'notif-ucapan';
        document.querySelector('.form-ucapan').after(el);
    }
    el.className = 'notif-ucapan ' + tipe;
    el.innerText = teks;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ==========================================
// INIT — Jalankan saat halaman pertama dimuat
// ==========================================
window.addEventListener('DOMContentLoaded', function () {
    // Ucapan dimuat saat tamu klik "Buka Undangan" (lihat bagian 3)
    // tapi juga kita siapkan di sini jika konten sudah terlihat
    const konten = document.getElementById('konten-utama');
    if (!konten.classList.contains('hidden')) {
        muatUcapan();
    }
});
