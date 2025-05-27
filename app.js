// Ders ve konu listesi (ileride veri kaydetme için burası genişletilebilir)
const topicsByLesson = {
  Matematik: ['Problemler', 'Geometri', 'Fonksiyonlar', 'Limit', 'Türev'],
  Fizik: ['Kuvvet', 'Hareket', 'Elektrik', 'Optik'],
  Kimya: ['Atom', 'Periyodik Sistem', 'Kimyasal Tepkimeler'],
  Biyoloji: ['Hücre', 'Canlılar Alemi', 'Ekoloji'],
  Tarih: ['İnkılaplar', 'Osmanlı', 'Çağdaş Dünya']
};

// Çalışma kayıtlarını tarihli olarak tutmak için
let studyRecords = []; // {lesson, topic, seconds, date}

// Çalışma sürelerini tutan obje (ileride localStorage ile kalıcı yapılabilir)
let studyTimes = {};

// Seçili ders ve konu
let selectedLesson = '';
let selectedTopic = '';

// Sayaç değişkenleri
let timer = null;
let timeLeft = 25 * 60; // Varsayılan 25 dakika
let isRunning = false;
let currentStart = null;

// Ayarlar ile ilgili değişkenler
let pomodoroDuration = 25; // dakika
let selectedTheme = 'default';
let soundEnabled = true;

// HTML elementleri
const lessonSelect = document.getElementById('lesson');
const topicSelect = document.getElementById('topic');
const timerLabel = document.getElementById('timer-label');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const reportBtn = document.getElementById('report-btn');
console.log('Rapor butonu bulundu:', reportBtn); // DEBUG
const reportModal = document.getElementById('report-modal');
console.log('Rapor modalı bulundu:', reportModal); // DEBUG
const reportContent = document.getElementById('report-content');
const closeModal = document.querySelector('.close');

// Ayarlar modalı elementleri
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.querySelector('.close-settings');
const pomodoroInput = document.getElementById('pomodoro-duration');
const themeSelect = document.getElementById('theme-select');
const soundCheckbox = document.getElementById('sound-enabled');
const saveSettingsBtn = document.getElementById('save-settings');

// TEST BUTONLARI
const fastForwardBtn = document.getElementById('fast-forward-btn');
const finishNowBtn = document.getElementById('finish-now-btn');

// Ders ve konu kısaltmaları
const lessonShort = {
  Matematik: 'MAT',
  Fizik: 'FZK',
  Kimya: 'KMY',
  Biyoloji: 'BYL',
  Tarih: 'TRH'
};
const topicShort = {
  Problemler: 'PRB',
  Geometri: 'GEO',
  Fonksiyonlar: 'FNK',
  Limit: 'LMT',
  Türev: 'TRV',
  Kuvvet: 'KVT',
  Hareket: 'HRK',
  Elektrik: 'ELK',
  Optik: 'OPT',
  Atom: 'ATM',
  'Periyodik Sistem': 'PRS',
  'Kimyasal Tepkimeler': 'KTP',
  Hücre: 'HCR',
  'Canlılar Alemi': 'CLA',
  Ekoloji: 'EKL',
  İnkılaplar: 'INK',
  Osmanlı: 'OSM',
  'Çağdaş Dünya': 'CDA'
};

// Ders seçilince konuları doldur
lessonSelect.addEventListener('change', () => {
  selectedLesson = lessonSelect.value;
  topicSelect.innerHTML = '<option value="">Konu seçiniz</option>';
  if (topicsByLesson[selectedLesson]) {
    topicsByLesson[selectedLesson].forEach(topic => {
      const opt = document.createElement('option');
      opt.value = topic;
      opt.textContent = topic;
      topicSelect.appendChild(opt);
    });
  }
});

topicSelect.addEventListener('change', () => {
  selectedTopic = topicSelect.value;
});

// Sayaç formatlama
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerLabel() {
  timerLabel.textContent = formatTime(timeLeft);
}

// Sayaç başlat
startBtn.addEventListener('click', () => {
  if (!selectedLesson || !selectedTopic) {
    alert('Lütfen önce ders ve konu seçin!');
    return;
  }
  if (!isRunning) {
    isRunning = true;
    currentStart = Date.now();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerLabel();
      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        addStudyTime(selectedLesson, selectedTopic, pomodoroDuration * 60); // Ayarlanan süre kadar ekle
        if (soundEnabled) playBeep();
        alert('Süre doldu!');
        timeLeft = pomodoroDuration * 60;
        updateTimerLabel();
      }
    }, 1000);
  }
});

// Sayaç duraklat
pauseBtn.addEventListener('click', () => {
  if (isRunning) {
    isRunning = false;
    clearInterval(timer);
    // Geçen süreyi ekle
    if (currentStart) {
      const elapsed = Math.floor((Date.now() - currentStart) / 1000);
      addStudyTime(selectedLesson, selectedTopic, elapsed);
    }
  }
});

// Sayaç sıfırla
resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(timer);
  timeLeft = pomodoroDuration * 60;
  updateTimerLabel();
});

// Çalışma süresini ekle (tarihli)
function addStudyTime(lesson, topic, seconds) {
  if (!lesson || !topic) return;
  const now = new Date();
  studyRecords.push({ lesson, topic, seconds, date: now.toISOString() });
}

// Raporu göster
reportBtn.addEventListener('click', () => {
  showReport('day'); // Varsayılan günlük
  reportModal.style.display = 'block';
});

// Rapor filtre butonları
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showReport(btn.dataset.range);
  });
});

// Chart.js chart referansları (ileride başka grafik türleri eklemek için buradan yönetilebilir)
let barChart, pieChart, lineChart;
// Grafik renk paleti (her ders/konu için ayırt edici)
const chartColors = [
  '#1976d2', '#e53935', '#ffb300', '#43a047', '#8e24aa', '#00838f', '#f4511e', '#3949ab', '#c0ca33', '#6d4c41', '#d81b60', '#00acc1', '#fbc02d', '#5e35b1', '#039be5', '#7cb342', '#fb8c00', '#546e7a'
];

function showReport(range) {
  // Sayfa geçişi için tüm rapor alanını temizle
  reportContent.innerHTML = '';
  // document.getElementById('report-graph').style.display = 'none'; // Bu satır siliniyor

  // Grafik alanlarını gizle/göster
  document.getElementById('bar-chart').style.display = 'none';
  document.getElementById('pie-chart').style.display = 'none';
  document.getElementById('line-chart').style.display = 'none';

  // Tarih aralığına göre filtrele
  const now = new Date();
  let start;
  if (range === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === 'week') {
    const day = now.getDay() || 7;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const filtered = studyRecords.filter(r => new Date(r.date) >= start);

  if (range === 'day') {
    // GÜNLÜK TABLO VE GRAFİKLER
    document.getElementById('bar-chart').style.display = ''; // Bar ve Pie göster
    document.getElementById('pie-chart').style.display = '';

    const summary = {};
    filtered.forEach(r => {
      const l = lessonShort[r.lesson] || r.lesson;
      const t = topicShort[r.topic] || r.topic;
      if (!summary[l]) summary[l] = {};
      if (!summary[l][t]) summary[l][t] = 0;
      summary[l][t] += r.seconds;
    });
    let html = '<table class="stat-table"><tr><th>Ders</th><th>Konu</th><th>Süre (dk)</th></tr>';
    for (const l in summary) {
      for (const t in summary[l]) {
        html += `<tr><td>${l}</td><td>${t}</td><td>${Math.round(summary[l][t]/60)}</td></tr>`;
      }
    }
    html += '</table>';
    if (filtered.length === 0) html = 'Henüz kayıt yok.';
    reportContent.innerHTML = html;

    // Grafik çiz
    drawBarAndPieCharts(summary); // Yeni fonksiyon adı

  } else if (range === 'week') {
    // HAFTALIK TABLO VE GRAFİKLER
    document.getElementById('line-chart').style.display = ''; // Line göster

    // 7 gün başlık
    const days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
    let weekData = {};
    for (let i=0; i<7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = d.toISOString().slice(0,10);
      weekData[key] = [];
    }
    filtered.forEach(r => {
      const d = new Date(r.date).toISOString().slice(0,10);
      if (weekData[d]) {
        weekData[d].push(r);
      }
    });
    let html = '<table class="stat-table"><tr><th>Gün</th>';
    days.forEach(day => html += `<th>${day}</th>`);
    html += '</tr>';
    // Her ders-konu için satır
    const allShorts = {};
    filtered.forEach(r => {
      const l = lessonShort[r.lesson] || r.lesson;
      const t = topicShort[r.topic] || r.topic;
      allShorts[l+'-'+t] = {l, t};
    });
    Object.keys(allShorts).forEach(key => {
      html += `<tr><td>${allShorts[key].l} - ${allShorts[key].t}</td>`;
      for (let i=0; i<7; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i).toISOString().slice(0,10);
        const total = weekData[d].filter(r => (lessonShort[r.lesson]||r.lesson)===allShorts[key].l && (topicShort[r.topic]||r.topic)===allShorts[key].t).reduce((a,b)=>a+b.seconds,0);
        html += `<td>${total ? Math.round(total/60) : ''}</td>`;
      }
      html += '</tr>';
    });
    html += '</table>';
    if (filtered.length === 0) html = 'Henüz kayıt yok.';
    reportContent.innerHTML = html;

    // Grafik çiz
    drawLineChart(filtered, start); // Yeni fonksiyon adı ve parametreler

  } else if (range === 'month') {
    // AYLIK TABLO VE GRAFİKLER
    document.getElementById('bar-chart').style.display = ''; // Bar ve Pie göster
    document.getElementById('pie-chart').style.display = '';

    const summary = {};
    filtered.forEach(r => {
      const l = lessonShort[r.lesson] || r.lesson;
      const t = topicShort[r.topic] || r.topic;
      if (!summary[l]) summary[l] = {};
      if (!summary[l][t]) summary[l][t] = 0;
      summary[l][t] += r.seconds;
    });
    let html = '<table class="stat-table"><tr><th>Ders</th><th>Konu</th><th>Süre (dk)</th></tr>';
    for (const l in summary) {
      for (const t in summary[l]) {
        html += `<tr><td>${l}</td><td>${t}</td><td>${Math.round(summary[l][t]/60)}</td></tr>`;
      }
    }
    html += '</table>';
    if (filtered.length === 0) html = 'Henüz kayıt yok.';
    reportContent.innerHTML = html;

    // Grafik çiz
    drawBarAndPieCharts(summary); // Yeni fonksiyon adı
  }
  // // Burada ileride başka grafik türleri (ör. radar, doughnut, stacked bar) eklenebilir
}

// Bar ve Pie grafiklerini çizen yeni fonksiyon
function drawBarAndPieCharts(summary) {
   // Bar ve Pie için veri hazırla
   const labels = [];
   const data = [];
   const pieLabels = [];
   const pieData = [];
   for (const l in summary) {
     let lessonSum = 0;
     for (const t in summary[l]) {
       labels.push(l + '-' + t);
       data.push(Math.round(summary[l][t]/60));
       lessonSum += summary[l][t];
     }
     pieLabels.push(l);
     pieData.push(Math.round(lessonSum/60));
   }
   // Bar Chart
   if (barChart) barChart.destroy();
   barChart = new Chart(document.getElementById('bar-chart').getContext('2d'), {
     type: 'bar',
     data: {
       labels,
       datasets: [{
         label: 'Süre (dk)',
         data,
         backgroundColor: labels.map((_,i)=>chartColors[i%chartColors.length]),
       }]
     },
     options: {
       responsive: true,
       plugins: {
         legend: { display: false },
         tooltip: { enabled: true }
       },
       scales: {
         x: { ticks: { color: '#333', font: {weight:'bold'} } },
         y: { beginAtZero: true, ticks: { color: '#333' } }
       }
     }
   });
   // Pie Chart
   if (pieChart) pieChart.destroy();
   pieChart = new Chart(document.getElementById('pie-chart').getContext('2d'), {
     type: 'pie',
     data: {
       labels: pieLabels,
       datasets: [{
         data: pieData,
         backgroundColor: pieLabels.map((_,i)=>chartColors[i%chartColors.length]),
       }]
     },
     options: {
       responsive: true,
       plugins: {
         legend: { position: 'bottom', labels: {color:'#333'} },
         tooltip: { enabled: true }
       }
     }
   });
}

// Line grafik çizen yeni fonksiyon
function drawLineChart(filteredRecords, weekStartDate) {
  const days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  let weekTotals = Array(7).fill(0);
  for (let i=0; i<7; i++) {
    const d = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + i).toISOString().slice(0,10);
    weekTotals[i] = filteredRecords.filter(r => new Date(r.date).toISOString().slice(0,10) === d).reduce((a,b)=>a+b.seconds,0);
  }
  // Line Chart
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('line-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Toplam Süre (dk)',
        data: weekTotals.map(s=>Math.round(s/60)),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.15)',
        tension: 0.3,
        pointBackgroundColor: days.map((_,i)=>chartColors[i%chartColors.length]),
        pointRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { ticks: { color: '#333', font: {weight:'bold'} } },
        y: { beginAtZero: true, ticks: { color: '#333' } }
      }
    }
  });
}

closeModal.addEventListener('click', () => {
  reportModal.style.display = 'none';
});

window.onclick = function(event) {
  if (event.target === reportModal) {
    reportModal.style.display = 'none';
  }
};

// Ayarlar modalını aç
settingsBtn.addEventListener('click', () => {
  pomodoroInput.value = pomodoroDuration;
  themeSelect.value = selectedTheme;
  soundCheckbox.checked = soundEnabled;
  settingsModal.style.display = 'block';
});

closeSettings.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

// Ayarları kaydet
saveSettingsBtn.addEventListener('click', () => {
  pomodoroDuration = parseInt(pomodoroInput.value) || 25;
  selectedTheme = themeSelect.value;
  soundEnabled = soundCheckbox.checked;
  // Temayı uygula
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  if (selectedTheme !== 'default') {
    document.body.classList.add('theme-' + selectedTheme);
  }
  // Süreyi uygula
  timeLeft = pomodoroDuration * 60;
  updateTimerLabel();
  settingsModal.style.display = 'none';
});

// Basit beep sesi (ileride farklı sesler eklenebilir)
function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = 880;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.value = 0.1;
  o.start();
  setTimeout(() => { o.stop(); ctx.close(); }, 300);
}

// TEST BUTONLARI
fastForwardBtn.addEventListener('click', () => {
  if (isRunning && timeLeft > 10) {
    timeLeft -= 10;
    updateTimerLabel();
  } else if (isRunning) {
    timeLeft = 1;
    updateTimerLabel();
  }
});

finishNowBtn.addEventListener('click', () => {
  if (isRunning) {
    timeLeft = 1;
    updateTimerLabel();
  }
});

// // Burada ileride localStorage ile veri kaydetme eklenebilir
// // Burada ileride tema desteği eklenebilir

updateTimerLabel(); 