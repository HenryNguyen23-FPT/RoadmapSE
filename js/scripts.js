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

let subjectsData = [];


// Hàm load dữ liệu từ JSON
async function loadSubjectsFromJSON() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        subjectsData = data;
        
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

                    <div class="alert alert-${subject.noteColor} border-start bg-${subject.noteColor} bg-opacity-10">
                        <strong><i class="bi ${subject.noteIcon} me-2"></i>Ghi chú:</strong>
                        <p class="mb-0 small">${subject.note}</p>
                    </div>
                </div>
            `;
            contentContainer.innerHTML += contentItem;
        });

        if(data.length > 0) {
            downloadBtn.href = data[0].file;
        }

    } catch (error) {
        console.error('Lỗi tải data:', error);
        document.getElementById('v-pills-tab').innerHTML = '<p class="text-danger">Lỗi tải dữ liệu.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadSubjectsFromJSON);
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-view-lesson')) {
        const btn = e.target.closest('.btn-view-lesson');
        const contentId = btn.getAttribute('data-content-id');
        const [subjectId, lessonType] = contentId.split('-');
        
        // Tìm trong dữ liệu đã load
        const subject = subjectsData.find(s => s.id === subjectId);
        
        if (subject && subject.subLessons) {
            const lesson = subject.subLessons.find(l => l.type === lessonType);
            
            if (lesson) {
                // Cập nhật offcanvas
                document.getElementById('offcanvasTitle').textContent = lesson.name;
                document.getElementById('offcanvasContent').innerHTML = lesson.content;
                
                // Hiển thị offcanvas
                const offcanvasElement = document.getElementById('lessonOffcanvas');
                const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                offcanvas.show();
            }
        }
    }
});

document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = this;

    // 1. Regex Patterns
    const patterns = {
        name: /^[\p{L}\s]{3,50}$/u,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^\d{10,15}$/,
        // allow multiline message
        message: /^[\s\S]{10,500}$/
    };

    // 2. Inputs
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const submitBtn = form.querySelector("button[type='submit']");

    // 3. Validation
    nameInput.setCustomValidity(
        patterns.name.test(nameInput.value.trim())
            ? ""
            : "Name must be 3–50 letters"
    );

    emailInput.setCustomValidity(
        patterns.email.test(emailInput.value.trim())
            ? ""
            : "Invalid email address"
    );

    if (phoneInput.value.trim()) {
        phoneInput.setCustomValidity(
            patterns.phone.test(phoneInput.value.trim())
                ? ""
                : "Phone must be 10–15 digits"
        );
    } else {
        phoneInput.setCustomValidity("");
    }

    messageInput.setCustomValidity(
        patterns.message.test(messageInput.value.trim())
            ? ""
            : "Message must be 10–500 characters"
    );

    // 4. Bootstrap validation
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    // 5. Prepare data
    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim()
    };

    try {
        submitBtn.disabled = true;

        const res = await fetch("http://localhost:3000/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Server error");

        const result = await res.json();

        if (result.success) {
            document.getElementById("submitSuccessMessage").classList.remove("d-none");
            document.getElementById("submitErrorMessage").classList.add("d-none");
            form.reset();
            form.classList.remove("was-validated");
        } else {
            throw new Error("Save failed");
        }

    } catch (err) {
        document.getElementById("submitErrorMessage").classList.remove("d-none");
    } finally {
        submitBtn.disabled = false;
    }
});
