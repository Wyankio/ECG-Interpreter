# ECG Interpreter Lab

Versi awal aplikasi latihan interpretasi ECG menggunakan sample median waveform dari dataset ACS.

## Isi
- `index.html` halaman utama
- `app/` UI dan renderer 12-lead
- `algorithms/` kriteria dasar yang akan dikembangkan
- `data/cases.json` metadata sample
- `data/med/` 36 sample `.med`

## Menjalankan
Aplikasi memakai `fetch()` untuk membaca file `.med`, jadi jangan membuka `index.html` dengan `file://`. Jalankan melalui GitHub Pages atau local web server.

## Catatan data
`.med` pada sample ini berisi 12-lead median waveform 500 Hz. Ini bukan raw 10-second ECG. Karena itu rhythm/rate dan aritmia belum dinilai otomatis pada versi ini.

## Roadmap
1. Renderer 12-lead yang stabil
2. Measurement P, PR, QRS, QT, axis, ST-T
3. RBBB/LBBB dan hypertrophy
4. Mode latihan per langkah
5. Raw WFDB untuk rhythm dan arrhythmia
6. Validasi terhadap label dataset dan kasus klinis
