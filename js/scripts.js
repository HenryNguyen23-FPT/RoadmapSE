document.addEventListener("DOMContentLoaded", function() {
    const downloadBtn = document.getElementById('btn-download-dynamic');
    const timelineItems = document.querySelectorAll('.timeline-item');

    function updateDownloadLink(item) {
        // Lấy đường dẫn từ thuộc tính data-file
        const fileLink = item.getAttribute('data-file');
        
        if (fileLink) {
            downloadBtn.setAttribute('href', fileLink);
            downloadBtn.classList.remove('disabled');
            downloadBtn.innerHTML = '<div class="d-inline-block bi bi-download me-2"></div> Download Material';
        } else {
            downloadBtn.setAttribute('href', '#');
            downloadBtn.classList.add('disabled');
            downloadBtn.innerHTML = '<div class="d-inline-block bi bi-x-circle me-2"></div> No Material';
        }
    }

    timelineItems.forEach(item => {
        item.addEventListener('click', function() { 
            updateDownloadLink(this);
        });
    });

    const activeItem = document.querySelector('.timeline-item.active');
    if (activeItem) {
        updateDownloadLink(activeItem);
    }
});

// Hàm load dữ liệu từ JSON
async function loadSubjectsFromJSON() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        const menuContainer = document.getElementById('v-pills-tab');
        const contentContainer = document.getElementById('v-pills-tabContent');
        const downloadBtn = document.getElementById('btn-download-dynamic');

        // Xóa loading spinner
        menuContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        data.forEach((subject, index) => {
            const isActive = index === 0 ? 'active' : '';
            
            // Tạo thẻ a cho menu
            const menuItem = document.createElement('a');
            menuItem.className = `timeline-item list-group-item-action ${isActive}`;
            menuItem.id = `tab-${subject.id}`;
            menuItem.setAttribute('data-bs-toggle', 'pill');
            menuItem.setAttribute('data-bs-target', `#content-${subject.id}`);
            menuItem.setAttribute('role', 'tab');
            menuItem.setAttribute('type', 'button');
            // Sự kiện khi click vào menu thì đổi link download
            menuItem.onclick = function() { 
                downloadBtn.href = subject.file; 
            };
            
            menuItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content-mini">
                    <h5 class="fw-bolder mb-0">${subject.code}</h5>
                    <small class="text-muted">${subject.name}</small>
                </div>
            `;
            menuContainer.appendChild(menuItem);


            const isShowActive = index === 0 ? 'show active' : '';

            // Xử lý danh sách nút con (Sub-lessons)
            let subButtonsHTML = '';
            if (subject.subLessons && subject.subLessons.length > 0) {
                subject.subLessons.forEach(sub => {
                    subButtonsHTML += `
                        <button class="btn btn-sub-lesson bg-white text-start btn-view-lesson" 
                                data-content-id="${subject.id}-${sub.type}">
                            <i class="bi ${sub.icon} me-2"></i>${sub.name}
                        </button>
                    `;
                });
            }

            const contentItem = `
                <div class="tab-pane fade ${isShowActive}" id="content-${subject.id}" role="tabpanel">
                    <div class="d-flex align-items-center mb-3">
                        <span class="badge bg-gradient-primary-to-secondary me-3 p-2">${subject.code}</span>
                        <h2 class="fw-bolder mb-0 text-primary">${subject.name}</h2>
                    </div>
                    <p class="lead text-muted">${subject.desc}</p>
                    <hr>
                    
                    <div class="mb-3">
                        <button class="btn btn-outline-orange w-100 d-flex justify-content-between align-items-center" 
                                type="button" data-bs-toggle="collapse" 
                                data-bs-target="#menu-${subject.id}" aria-expanded="false">
                            <span><i class="bi bi-collection-play me-2"></i>Chọn nội dung học</span>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        
                        <div class="collapse mt-2" id="menu-${subject.id}">
                            <div class="card card-body bg-light border-0">
                                <div class="d-grid gap-2">
                                    ${subButtonsHTML}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-${subject.noteColor} border-0 bg-${subject.noteColor} bg-opacity-10">
                        <strong><i class="bi ${subject.noteIcon} me-2"></i>Ghi chú:</strong>
                        <p class="mb-0 small">${subject.note}</p>
                    </div>
                </div>
            `;
            contentContainer.innerHTML += contentItem;
        });

        // Set link download mặc định cho môn đầu tiên
        if(data.length > 0) {
            downloadBtn.href = data[0].file;
        }

    } catch (error) {
        console.error('Lỗi tải data:', error);
        document.getElementById('v-pills-tab').innerHTML = '<p class="text-danger">Lỗi tải dữ liệu. Hãy chạy bằng Live Server.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadSubjectsFromJSON);



const lessonData = {
    // --- PHẦN 1: NGỮ PHÁP (JPD113) ---
    'jpd-grammar': {
        title: 'Ngữ pháp cơ bản',
        content: `
            <div class="alert alert-primary mb-3"><i class="bi bi-info-circle me-2"></i>Các mẫu câu khẳng định, phủ định và nghi vấn cơ bản.</div>
            
            <div class="card mb-3 shadow-sm border-0">
                <div class="card-body">
                    <h5 class="card-title text-primary fw-bold">1. N1 wa N2 desu</h5>
                    <p class="mb-1"><strong>Ý nghĩa:</strong> N1 là N2.</p>
                    <p class="text-muted small">Dùng để giới thiệu tên, nghề nghiệp, quốc tịch.</p>
                    <div class="bg-light p-2 rounded border">
                        <span class="text-danger">Watashi</span> wa <span class="text-success">Gakusei</span> desu.<br>
                        (Tôi là sinh viên)
                    </div>
                </div>
            </div>

            <div class="card mb-3 shadow-sm border-0">
                <div class="card-body">
                    <h5 class="card-title text-primary fw-bold">2. N1 wa N2 dewa arimasen</h5>
                    <p class="mb-1"><strong>Ý nghĩa:</strong> N1 không phải là N2.</p>
                    <div class="bg-light p-2 rounded border">
                        <span class="text-danger">Santosu-san</span> wa <span class="text-success">Gakusei</span> dewa arimasen.<br>
                        (Anh Santos không phải là sinh viên)
                    </div>
                </div>
            </div>

            <div class="card mb-3 shadow-sm border-0">
                <div class="card-body">
                    <h5 class="card-title text-primary fw-bold">3. S + ka?</h5>
                    <p class="mb-1"><strong>Ý nghĩa:</strong> Câu hỏi nghi vấn (Có phải... không?)</p>
                    <div class="bg-light p-2 rounded border">
                        A: Mira-san wa <span class="text-success">Amerika-jin</span> desu ka?<br>
                        B: Hai, Amerika-jin desu.<br>
                        (A: Mira có phải người Mỹ không? - B: Vâng, đúng vậy)
                    </div>
                </div>
            </div>
        `
    },

    // --- PHẦN 2: TỪ VỰNG (JPD113) ---
    'jpd-vocab': {
        title: 'Từ vựng (Kotoba) - Bài 1',
        content: `
            <div class="mb-3">
                <input type="text" class="form-control" placeholder="Tìm kiếm từ vựng">
            </div>
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr><th scope="col">Hiragana</th><th scope="col">Kanji</th><th scope="col">Nghĩa Tiếng Việt</th></tr>
                </thead>
                <tbody>
                    <tr><td class="fw-bold text-primary">watashi</td><td>私</td><td>Tôi</td></tr>
                    <tr><td class="fw-bold text-primary">gakusei</td><td>学生</td><td>Học sinh, sinh viên</td></tr>
                    <tr><td class="fw-bold text-primary">sensei</td><td>先生</td><td>Giáo viên, Thầy/Cô</td></tr>
                    <tr><td class="fw-bold text-primary">kaishain</td><td>会社員</td><td>Nhân viên công ty</td></tr>
                    <tr><td class="fw-bold text-primary">shain</td><td>社員</td><td>Nhân viên (của công ty ~)</td></tr>
                    <tr><td class="fw-bold text-primary">ginkouin</td><td>銀行員</td><td>Nhân viên ngân hàng</td></tr>
                    <tr><td class="fw-bold text-primary">isha</td><td>医者</td><td>Bác sĩ</td></tr>
                </tbody>
            </table>
        `
    },

    // --- PHẦN 3: HỘI THOẠI (JPD113) ---
    'jpd-kaiwa': {
        title: 'Hội thoại (Kaiwa) - Jiko Shoukai',
        content: `
            <p class="lead small text-muted">Bối cảnh: Lần đầu gặp mặt và giới thiệu bản thân.</p>
            <hr>
            <div class="d-flex mb-3">
                <div class="flex-shrink-0"><div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">A</div></div>
                <div class="flex-grow-1 ms-3"><div class="card border-0 bg-light"><div class="card-body p-2"><strong>Mira:</strong> Ohayou gozaimasu. Watashi wa Mira desu.</div></div></div>
            </div>
            <div class="d-flex mb-3 flex-row-reverse">
                <div class="flex-shrink-0"><div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">B</div></div>
                <div class="flex-grow-1 me-3 text-end"><div class="card border-0 bg-primary bg-opacity-10"><div class="card-body p-2"><strong>Sato:</strong> Ohayou gozaimasu. Sato desu.</div></div></div>
            </div>
             <div class="d-flex mb-3">
                <div class="flex-shrink-0"><div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">A</div></div>
                <div class="flex-grow-1 ms-3"><div class="card border-0 bg-light"><div class="card-body p-2"><strong>Mira:</strong> Sato-san wa gakusei desu ka?</div></div></div>
            </div>
            <div class="d-flex mb-3 flex-row-reverse">
                <div class="flex-shrink-0"><div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">B</div></div>
                <div class="flex-grow-1 me-3 text-end"><div class="card border-0 bg-primary bg-opacity-10"><div class="card-body p-2"><strong>Sato:</strong> Iie, gakusei dewa arimasen. Kaishain desu.</div></div></div>
            </div>
        `
    },

    // --- PHẦN 4: HÁN TỰ (JPD113) ---
    'jpd-kanji': {
        title: 'Hán tự cơ bản (Nhập môn)',
        content: `
            <div class="row row-cols-2 g-3">
                <div class="col"><div class="card h-100 text-center border-primary"><div class="card-header bg-primary text-white display-4 py-3">日</div><div class="card-body"><h5 class="card-title">NHẬT</h5><p class="card-text small">Mặt trời, ngày</p><hr><div class="text-start small"><strong>On:</strong> NICHI, JITSU<br><strong>Kun:</strong> hi, -ka</div></div></div></div>
                <div class="col"><div class="card h-100 text-center border-danger"><div class="card-header bg-danger text-white display-4 py-3">月</div><div class="card-body"><h5 class="card-title">NGUYỆT</h5><p class="card-text small">Mặt trăng, tháng</p><hr><div class="text-start small"><strong>On:</strong> GETSU, GATSU<br><strong>Kun:</strong> tsuki</div></div></div></div>
                <div class="col"><div class="card h-100 text-center border-success"><div class="card-header bg-success text-white display-4 py-3">木</div><div class="card-body"><h5 class="card-title">MỘC</h5><p class="card-text small">Cây, gỗ</p><hr><div class="text-start small"><strong>On:</strong> MOKU, BOKU<br><strong>Kun:</strong> ki</div></div></div></div>
                <div class="col"><div class="card h-100 text-center border-warning"><div class="card-header bg-warning text-white display-4 py-3">人</div><div class="card-body"><h5 class="card-title">NHÂN</h5><p class="card-text small">Người</p><hr><div class="text-start small"><strong>On:</strong> JIN, NIN<br><strong>Kun:</strong> hito</div></div></div></div>
            </div>
        `
    }
    
    //thêm các môn khác

    //MAS
    //DBI
    //LAB
    //SWEc


};

// 2. LOGIC XỬ LÝ SỰ KIỆN
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-view-lesson');
    
    // Lấy phần tử Offcanvas
    const offcanvasElement = document.getElementById('dynamicOffcanvas');
    if (!offcanvasElement) {
        console.error("Không tìm thấy phần tử Offcanvas có id='dynamicOffcanvas'");
        return;
    }
    const myOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    
    const titleEl = document.getElementById('dynamicTitle');
    const bodyEl = document.getElementById('dynamicBody');

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const contentId = this.getAttribute('data-content-id');
            const data = lessonData[contentId];

            if (data) {
                titleEl.textContent = data.title;
                bodyEl.innerHTML = data.content;
            } else {
                titleEl.textContent = "Đang cập nhật";
                bodyEl.innerHTML = `<div class="alert alert-warning">Nội dung cho mục này đang được xây dựng!</div>`;
            }
            myOffcanvas.show();
        });
    });
});


