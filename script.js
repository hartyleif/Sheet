function generateSchedule(month, year, group, type) {
    const codeSch = [
        ['Bekerja di lapangan Onshore', '92626'],
        ['Bekerja di lapangan Onshore pada malam hari', '84450'],
        ['Hari Libur Reguler', '90016']
    ];
    const groupStart = {
        'grup-a': new Date(2025, 0, 8),  // 8 Januari 2025
        'grup-b': new Date(2025, 0, 1),  // 1 Januari 2025
        'grup-c': new Date(2025, 0, 15), // 15 Januari 2025
        'grup-d': new Date(2025, 0, 23)  // 23 Januari 2025
    };
    const times = {
        '92626': ['06:00', '18:00', '18:00', '18:30'],
        '84450': ['18:00', '06:00', '06:00', '06:30'],
        '90016': ["", "", "", ""]
    }
    const patternDays = [7, 7, 14]; // 7 hari, 7 hari, 14 hari
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let schedule = [];

    const startPattern = groupStart[group] || new Date(2025, 0, 1);

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        // Hitung selisih hari dari tanggal mulai pattern
        const diffTime = currentDate - startPattern;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        // Jika sebelum tanggal mulai pattern, default ke Hari Libur Reguler
        let patternIdx = 2;
        if (diffDays >= 0) {
            const mod = diffDays % 28;
            if (mod < 7) patternIdx = 0;
            else if (mod < 14) patternIdx = 1;
            else patternIdx = 2;
        }
        let sch = type=="code"? 1 : 0;
        schedule.push([
            codeSch[patternIdx][sch], // Kategori kerja
            times[codeSch[patternIdx][1]][0], 
            times[codeSch[patternIdx][1]][1],
            times[codeSch[patternIdx][1]][2],
            times[codeSch[patternIdx][1]][3],
            codeSch[patternIdx][1][1] == '90016'? "" : document.cookie.split('; ').find(row => row.startsWith('remarks='))?.split('=')[1] || "",
            codeSch[patternIdx][1][1] == '90016'? "" : document.cookie.split('; ').find(row => row.startsWith('justification='))?.split('=')[1] || "" 
        ]);
    }

    let code = `
  var arr = ${JSON.stringify(schedule)};
  arr.forEach((e, i) => {
    let select = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsDdlCategory_\${i}\`);
    if (select) {
      select.value = e[0];
      select.dispatchEvent(new Event('change'));
    }  
    let startTime = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtBegTi_\${i}\`);
    let endTime = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtEndTi_\${i}\`);
    if (startTime && endTime) {
      startTime.value = e[1];
      endTime.value = e[2];
    }
    let otStart = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtOTFrom_\${i}\`);
    let otEnd = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtOTTo_\${i}\`);
    if (otStart && otEnd) {
      otStart.value = e[3];
      otEnd.value = e[4];
    }
    let remarks = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtRemarks_\${i}\`);
    let justification = document.getElementById(\`MainContent_TSNew_TsRptNewTs_TsTxtJustification_\${i}\`);
    if (remarks && justification) {
      remarks.value = e[5];
      justification.value = e[6];
    }
  });
  `;

  if (type == 'code') {
    return code;
  } else {
    return schedule;
  }
}
function saveCookies() {
    
    let remarks = document.getElementById("remarks").value;
    let justification = document.getElementById("justification").value;
    document.cookie = `remarks=${remarks}; path=/; max-age=31536000`; // 1 tahun
    document.cookie = `justification=${justification}; path=/; max-age=31536000`; // 1 tahun
    fetchData();
}

function menuDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('active');
}
function populateYearDropdown() {
    let yearSelect = document.getElementById("yearSelect");
    yearSelect.innerHTML = ""; 
    let currentYear = new Date().getFullYear();
    for (let i = currentYear - 3; i <= currentYear + 5; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        if (i === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

function setCurrentMonth() {
    let monthSelect = document.getElementById("monthSelect");
    let currentMonth = new Date().getMonth();
    monthSelect.value = currentMonth;
}

async function fetchData() {
    document.getElementById("output").textContent = "Mengambil data...";
    let selectedMonth = parseInt(document.getElementById("monthSelect").value);
    let selectedYear = parseInt(document.getElementById("yearSelect").value);
    let group = document.getElementById("group").value;
    let code = generateSchedule(selectedMonth, selectedYear, group, 'code');
    displayData(code);
    let schedule = generateSchedule(selectedMonth, selectedYear, group, 'table');
    generateTable(schedule);
}


function displayData(code) {            
    let outputElement = document.getElementById("output");
    outputElement.textContent = code;
    let script = document.createElement("script");
    script.textContent = code;
    document.body.appendChild(script);
}

function copyToClipboard() {
    let codeText = document.getElementById("output").textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        let button = document.getElementById("copyButton");
        button.textContent = "Copied!";
        setTimeout(() => button.textContent = "Copy", 2000);
    }).catch(err => {
        console.error("Error copying text: ", err);
    });
}

function generateTable(arr) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Kosongkan isi tabel sebelum menambahkan data baru
    let editIcon=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`

    const rows = arr.map((rowData, index) => {
    return `<tr>
        <td>${index + 1}</td>
        <td>${rowData[0]}</td>
        <td>${rowData[1]}</td>
        <td>${rowData[2]}</td>
        <td>${rowData[3]}</td>
        <td>${rowData[4]}</td>
        <td>${rowData[5]}</td>
        <td>${rowData[6]}</td>
    </tr>`;
    }).join('');

    tableBody.innerHTML = rows;
}

window.onload = function() {
    populateYearDropdown();
    setCurrentMonth();
    document.getElementById("remarks").value = document.cookie.split('; ').find(row => row.startsWith('remarks='))?.split('=')[1] || "";
    document.getElementById("justification").value = document.cookie.split('; ').find(row => row.startsWith('justification='))?.split('=')[1] || "";
    fetchData();
};
