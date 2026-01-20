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
        const response = await fetch('data/data.json');
        const data = await response.json();
        subjectsData = data;
        const menuContainer = document.getElementById('v-pills-tab');
        const contentContainer = document.getElementById('v-pills-tabContent');
        const downloadBtn = document.getElementById('btn-download-dynamic');
        menuContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        data.forEach((subject, index) => {
            const isActive = index === 0 ? 'active' : '';
            const menuItem = document.createElement('a');
            menuItem.className = `timeline-item list-group-item-action ${isActive}`;
            menuItem.id = `tab-${subject.id}`;
            menuItem.setAttribute('data-bs-toggle', 'pill');
            menuItem.setAttribute('data-bs-target', `#content-${subject.id}`);
            menuItem.setAttribute('role', 'tab');
            menuItem.setAttribute('type', 'button');

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
                document.getElementById('offcanvasTitle').textContent = lesson.name;
                document.getElementById('offcanvasContent').innerHTML = lesson.content;
                const offcanvasElement = document.getElementById('lessonOffcanvas');
                const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                offcanvas.show();
            }
        }
    }
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// --- PHẦN 1: LOGIC RENDER TIMELINE TỪ JSON ---

async function loadChallengesFromJSON() {
    const tabContainer = document.getElementById('challenge-tab');
    const contentContainer = document.getElementById('challenge-tabContent');

    if (!tabContainer || !contentContainer) return;

    try {
        const response = await fetch('data/challenge-data.json');
        const data = await response.json();

        // Tạo khung Timeline
        tabContainer.innerHTML = `
            <div class="timeline-container">
                <div class="timeline-wrapper">
                    <div class="timeline-line"></div>
                    <div id="nodes-render-area" class="d-flex w-100 justify-content-between"></div>
                </div>
            </div>
        `;

        const nodesArea = document.getElementById('nodes-render-area');
        contentContainer.innerHTML = '';

        data.forEach((item, index) => {
            const isActive = index === 0 ? 'active' : '';
            const isShowActive = index === 0 ? 'show active' : '';

            // Tạo Node (Cục tròn trên timeline)
            const nodeItem = document.createElement('div');
            nodeItem.className = `timeline-node ${isActive}`;

            // Sự kiện click vào node để xem chi tiết
            nodeItem.onclick = function() {
                document.querySelectorAll('.timeline-node').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('show', 'active'));
                this.classList.add('active');
                document.getElementById(`content-${item.id}`).classList.add('show', 'active');
            };

            // Lấy category chuẩn từ JSON (JPD, MAS, DBI...)
            const quizCategory = item.category || 'GEN';
            const imgUrl = item.image || `https://placehold.co/650x450?text=${item.code}`;

            nodeItem.innerHTML = `
                <div class="node-card-wrapper">
                    <div class="card" style="width: 12rem;"> 
                        <img src="${imgUrl}" class="card-img-top" alt="${item.name}" style="height: 140px; object-fit: cover;">
                        <div class="card-body text-center">
                            <h6 class="card-title text-primary">${item.code}</h6>
                            <p class="card-text text-muted text-truncate" style="font-size: 0.8rem;">${item.name}</p>
                            
                        <button onclick="event.stopPropagation(); fetchQuestions('${quizCategory}')" 
                            class="btn btn-quiz-start btn-primary px-4 py-2 rounded-pill shadow-sm" style="font-weight: 600; min-width: 120px;">
                            Làm Quiz
                        </button>
                        </div>
                    </div>
                </div>
                <div class="node-circle"></div>
            `;
            nodesArea.appendChild(nodeItem);

            const contentItem = `
                <div class="tab-pane fade ${isShowActive}" id="content-${item.id}">
                    <div class="card shadow border-0 rounded-4 mt-5">
                        <div class="card-body p-5">
                            <span class="badge bg-primary bg-gradient-primary-to-secondary mb-3 px-3 py-2 rounded-pill">${item.code}</span>
                            <h2 class="fw-bolder mb-3">${item.name}</h2>
                            <p class="lead text-muted mb-4">${item.desc}</p>
                            <hr>
                            <p>${item.mindmap || 'Chưa có sơ đồ tư duy'}</p>
                        </div>
                    </div>
                </div>
            `;
            contentContainer.innerHTML += contentItem;
        });

    } catch (error) {
        console.error('Lỗi tải data JSON:', error);
    }
}

// Gọi hàm load khi trang web tải xong
document.addEventListener('DOMContentLoaded', loadChallengesFromJSON);


// ĐƯỜNG DẪN API: Trỏ về máy bạn (localhost) để test
const API_URL = "http://localhost:3000/api/quiz"; 

let questions = [];     
let currentIdx = 0;     
let score = 0;          
let userChoice = null;  

// 1. Gọi API lấy câu hỏi
async function fetchQuestions(categoryCode) {
    questions = []; currentIdx = 0; score = 0;

    document.getElementById('subject-title').innerText = "Quiz: " + categoryCode;
    document.getElementById('quiz-modal').style.display = 'flex';
    document.getElementById('quiz-content').innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Đang tải câu hỏi từ Server...</p>
        </div>`;
    document.body.style.overflow = 'hidden'; 

    try {
        const res = await fetch(`${API_URL}/${categoryCode}`);
        
        if (!res.ok) throw new Error("Lỗi kết nối Server");
        
        const rawData = await res.json();

        if (rawData.length === 0) {
            document.getElementById('quiz-content').innerHTML = '<p class="text-center mt-5 text-danger">Chưa có câu hỏi nào trong Database!</p>';
            return;
        }

        
        questions = rawData.map(item => ({
            id: item.id,
            text: item.question_text,
            options: [item.option_a, item.option_b, item.option_c, item.option_d],
            correct: item.correct_answer ? item.correct_answer.trim().toUpperCase() : ''
        }));

        loadQuestion(); 

    } catch (error) {
        console.error(error);
        document.getElementById('quiz-content').innerHTML = `
            <div class="text-center text-danger mt-5">
                <h5>Lỗi kết nối!</h5>
                <p>Hãy chắc chắn bạn đã chạy lệnh: <code>node server.js</code></p>
            </div>`;
    }
}

let hasAnswered = false;

function loadQuestion() {
    const q = questions[currentIdx];
    const contentDiv = document.getElementById('quiz-content');
    const nextBtn = document.getElementById('next-btn');
    const labels = ['A', 'B', 'C', 'D'];
    
    hasAnswered = false;
    nextBtn.disabled = true; 
    nextBtn.innerText = (currentIdx === questions.length - 1) ? 'Kết thúc' : 'Tiếp theo';

    contentDiv.innerHTML = `
        <div class="question-text">
            <h4 class="mb-0">Câu ${currentIdx + 1}: ${q.text}</h4>
        </div>
        <div id="options-container">
            ${q.options.map((opt, index) => `
                <div class="option-btn" id="opt-${labels[index]}" onclick="selectAnswer('${labels[index]}')">
                    <span class="option-label">${labels[index]}</span>
                    <span class="option-text">${opt}</span>
                </div>
            `).join('')}
        </div>
        
        <div id="explanation" class="explanation-box">
            <strong>💡 Giải thích:</strong>
            <span>${q.explanation || 'Không có giải thích chi tiết.'}</span>
        </div>
    `;

    document.getElementById('question-status').innerText = `Câu ${currentIdx + 1}/${questions.length}`;
}

function selectAnswer(userPick) {
    if (hasAnswered) return;
    hasAnswered = true;

    const q = questions[currentIdx];
    const correctLabel = q.correct;
    
    // Lấy element các nút
    const userBtn = document.getElementById(`opt-${userPick}`);
    const correctBtn = document.getElementById(`opt-${correctLabel}`);
    const explanationBox = document.getElementById('explanation');
    const nextBtn = document.getElementById('next-btn');

    // Mở khóa nút Next
    nextBtn.disabled = false;

    // LOGIC CHẤM ĐIỂM
    if (userPick === correctLabel) {
        // 1. Nếu ĐÚNG
        userBtn.classList.add('correct'); 
        score++;
    } else {
        // 2. Nếu SAI
        userBtn.classList.add('wrong');  
        correctBtn.classList.add('correct');
        explanationBox.style.display = 'block';
    }
}


function nextQuestion() {
    // Tính điểm
    if (userChoice === questions[currentIdx].correct) {
        score++;
    }

    currentIdx++;
    if (currentIdx < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}


function showResult() {
    const percent = Math.round((score / questions.length) * 100);
    const msg = percent >= 50 ? "Chúc mừng! Bạn đã qua môn 🎉" : "Cố gắng hơn nhé! 💪";
    const color = percent >= 50 ? "text-success" : "text-danger";

    document.getElementById('quiz-content').innerHTML = `
        <div class="text-center mt-5">
            <h1 class="display-1 fw-bold ${color}">${score}/${questions.length}</h1>
            <p class="fs-5">Điểm số của bạn</p>
            <hr style="width: 50px; margin: 20px auto; border: 2px solid #ccc;">
            <h3 class="mt-3">${msg}</h3>
            <button onclick="closeQuiz()" class="btn btn-outline-dark rounded-pill px-4 mt-3">Đóng</button>
        </div>
    `;
    document.querySelector('.quiz-footer').style.display = 'none';
}

function closeQuiz() {
    document.getElementById('quiz-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Cho phép cuộn trang trở lại
    document.querySelector('.quiz-footer').style.display = 'flex'; // Reset footer
}

//contact form
document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = this;
    const patterns = {
        name: /^[\p{L}\s]{3,50}$/u,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^\d{10,15}$/,
        message: /^[\s\S]{10,500}$/
    };

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const submitBtn = form.querySelector("button[type='submit']");

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

    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

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
