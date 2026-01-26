document.addEventListener("DOMContentLoaded", function() {
    // === PHẦN 1: DOWNLOAD BUTTON (chỉ chạy nếu có element) ===
    const downloadBtn = document.getElementById('btn-download-dynamic');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (downloadBtn && timelineItems.length > 0) {
        function updateDownloadLink(item) {
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
    }
});

let subjectsData = [];

// === PHẦN 2: LOAD SUBJECTS (chỉ chạy nếu có element) ===
async function loadSubjectsFromJSON() {
    const menuContainer = document.getElementById('v-pills-tab');
    const contentContainer = document.getElementById('v-pills-tabContent');
    
    // ✅ Kiểm tra element có tồn tại không
    if (!menuContainer || !contentContainer) {
        return; // Không phải trang learn.html, bỏ qua
    }

    try {
        const response = await fetch('data/data.json');
        const data = await response.json();
        subjectsData = data;
        const downloadBtn = document.getElementById('btn-download-dynamic');
        
        menuContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        data.forEach((subject, index) => {
            // ... code cũ giữ nguyên
            const isActive = index === 0 ? 'active' : '';
            const menuItem = document.createElement('a');
            menuItem.className = `timeline-item list-group-item-action ${isActive}`;
            menuItem.id = `tab-${subject.id}`;
            menuItem.setAttribute('data-bs-toggle', 'pill');
            menuItem.setAttribute('data-bs-target', `#content-${subject.id}`);
            menuItem.setAttribute('role', 'tab');
            if (downloadBtn) {
                menuItem.onclick = () => { downloadBtn.href = subject.file; };
            }
            menuItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content-mini">
                    <h5 class="fw-bolder mb-0">${subject.code}</h5>
                    <small class="text-muted">${subject.name}</small>
                </div>`;
            menuContainer.appendChild(menuItem);

            let subButtonsHTML = '';
            if (subject.subLessons) {
                subject.subLessons.forEach(sub => {
                    if (sub.subLessons && sub.subLessons.length > 0) {
                        subButtonsHTML += `<div class="fw-bold mt-2 mb-1 text-primary small"><i class="bi ${sub.icon} me-2"></i>${sub.name}</div>`;
                        sub.subLessons.forEach(child => {
                            subButtonsHTML += `
                                <button class="btn btn-sub-lesson bg-white text-start btn-view-lesson ms-3 mb-1 border-light shadow-sm" 
                                        data-content-id="${subject.id}-${child.type}">
                                    <i class="bi ${child.icon || 'bi-dot'} me-2"></i>${child.name}
                                </button>`;
                        });
                    } else {
                        subButtonsHTML += `
                            <button class="btn btn-sub-lesson bg-white text-start btn-view-lesson mb-1 shadow-sm" 
                                    data-content-id="${subject.id}-${sub.type}">
                                <i class="bi ${sub.icon} me-2"></i>${sub.name}
                            </button>`;
                    }
                });
            }

            const isShowActive = index === 0 ? 'show active' : '';
            contentContainer.innerHTML += `
                <div class="tab-pane fade ${isShowActive}" id="content-${subject.id}" role="tabpanel">
                    <div class="d-flex align-items-center mb-3">
                        <span class="badge bg-gradient-primary-to-secondary me-3 p-2">${subject.code}</span>
                        <h2 class="fw-bolder mb-0 text-primary">${subject.name}</h2>
                    </div>
                    <p class="lead text-muted">${subject.desc}</p>
                    <hr>
                    <div class="mb-3">
                        <button class="btn btn-outline-orange w-100 d-flex justify-content-between align-items-center" 
                                type="button" data-bs-toggle="collapse" data-bs-target="#menu-${subject.id}">
                            <span><i class="bi bi-collection-play me-2"></i>Chọn nội dung học</span>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <div class="collapse mt-2" id="menu-${subject.id}">
                            <div class="card card-body bg-light border-0"><div class="d-grid">${subButtonsHTML}</div></div>
                        </div>
                    </div>
                    <div class="alert alert-${subject.noteColor} border-start bg-opacity-10">
                        <strong><i class="bi ${subject.noteIcon} me-2"></i>Ghi chú:</strong>
                        <p class="mb-0 small">${subject.note}</p>
                    </div>
                </div>`;
        });
        if(data.length > 0 && downloadBtn) downloadBtn.href = data[0].file;
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadSubjectsFromJSON);

// === PHẦN 3: TÌM KIẾM BÀI HỌC ===
function findLessonDeep(lessons, targetType) {
    for (const lesson of lessons) {
        if (lesson.type === targetType) return lesson;
        
        if (lesson.subLessons && lesson.subLessons.length > 0) {
            const found = findLessonDeep(lesson.subLessons, targetType);
            if (found) return found;
        }
    }
    return null;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-view-lesson');
    if (btn) {
        const contentId = btn.getAttribute('data-content-id');
        const [subjectId, lessonType] = contentId.split('-');
        
        const subject = subjectsData.find(s => s.id === subjectId);
        
        if (subject && subject.subLessons) {
            const lesson = findLessonDeep(subject.subLessons, lessonType);
            
            if (lesson) {
                const offcanvasTitleEl = document.getElementById('offcanvasTitle');
                const offcanvasContentEl = document.getElementById('offcanvasContent');
                
                if (offcanvasTitleEl && offcanvasContentEl) {
                    offcanvasTitleEl.textContent = lesson.name;
                    offcanvasContentEl.innerHTML = lesson.content;
                    
                    const offcanvasElement = document.getElementById('lessonOffcanvas');
                    if (offcanvasElement && typeof bootstrap !== 'undefined') {
                        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
                        offcanvas.show();
                    }
                }
            }
        }
    }
});

// === PHẦN 4: NAVBAR SCROLL ===
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// === PHẦN 5: LOAD CHALLENGES (chỉ chạy nếu có element) ===
async function loadChallengesFromJSON() {
    const tabContainer = document.getElementById('challenge-tab');
    const contentContainer = document.getElementById('challenge-tabContent');

    if (!tabContainer || !contentContainer) return; // Không phải trang challenge.html

    try {
        const response = await fetch('data/challenge-data.json');
        const data = await response.json();

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

            const nodeItem = document.createElement('div');
            nodeItem.className = `timeline-node ${isActive}`;

            nodeItem.onclick = function() {
                document.querySelectorAll('.timeline-node').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('show', 'active'));
                this.classList.add('active');
                const contentEl = document.getElementById(`content-${item.id}`);
                if (contentEl) contentEl.classList.add('show', 'active');
            };

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

document.addEventListener('DOMContentLoaded', loadChallengesFromJSON);

// === PHẦN 6: QUIZ SYSTEM ===
const API_URL = "https://roadmapse.onrender.com/api/quiz"; 

let questions = [];     
let currentIdx = 0;     
let score = 0;          
let userChoice = null;  
let hasAnswered = false;

async function fetchQuestions(categoryCode) {
    questions = []; currentIdx = 0; score = 0;

    const subjectTitleEl = document.getElementById('subject-title');
    const quizModalEl = document.getElementById('quiz-modal');
    const quizContentEl = document.getElementById('quiz-content');
    
    if (!subjectTitleEl || !quizModalEl || !quizContentEl) return;

    subjectTitleEl.innerText = "Quiz: " + categoryCode;
    quizModalEl.style.display = 'flex';
    quizContentEl.innerHTML = `
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
            quizContentEl.innerHTML = '<p class="text-center mt-5 text-danger">Chưa có câu hỏi nào trong Database!</p>';
            return;
        }

        questions = rawData.map(item => ({
            id: item.id,
            text: item.question_text,
            options: [item.option_a, item.option_b, item.option_c, item.option_d],
            correct: item.correct_answer ? item.correct_answer.trim().toUpperCase() : '',
            explanation: item.explanation
        }));

        loadQuestion(); 

    } catch (error) {
        console.error(error);
        quizContentEl.innerHTML = `
            <div class="text-center text-danger mt-5">
                <h5>Lỗi kết nối!</h5>
            </div>`;
    }
}

function loadQuestion() {
    const q = questions[currentIdx];
    const contentDiv = document.getElementById('quiz-content');
    const nextBtn = document.getElementById('next-btn');
    const statusEl = document.getElementById('question-status');
    
    if (!contentDiv || !nextBtn || !statusEl) return;
    
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

    statusEl.innerText = `Câu ${currentIdx + 1}/${questions.length}`;
}

function selectAnswer(userPick) {
    if (hasAnswered) return;
    hasAnswered = true;

    const q = questions[currentIdx];
    const correctLabel = q.correct;
    
    const userBtn = document.getElementById(`opt-${userPick}`);
    const correctBtn = document.getElementById(`opt-${correctLabel}`);
    const explanationBox = document.getElementById('explanation');
    const nextBtn = document.getElementById('next-btn');

    if (!userBtn || !nextBtn) return;

    nextBtn.disabled = false;

    if (userPick === correctLabel) {
        userBtn.classList.add('correct'); 
        score++;
    } else {
        userBtn.classList.add('wrong');  
        if (correctBtn) correctBtn.classList.add('correct');
        if (explanationBox) explanationBox.style.display = 'block';
    }
}

function nextQuestion() {
    currentIdx++;
    if (currentIdx < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const quizContentEl = document.getElementById('quiz-content');
    const quizFooterEl = document.querySelector('.quiz-footer');
    
    if (!quizContentEl) return;
    
    const percent = Math.round((score / questions.length) * 100);
    const msg = percent >= 50 ? "Chúc mừng! Bạn đã passed 🎉" : "Cố gắng hơn nhé! 💪";
    const color = percent >= 50 ? "text-success" : "text-danger";

    quizContentEl.innerHTML = `
        <div class="text-center mt-5">
            <h1 class="display-1 fw-bold ${color}">${score}/${questions.length}</h1>
            <p class="fs-5">Điểm số của bạn</p>
            <hr style="width: 50px; margin: 20px auto; border: 2px solid #ccc;">
            <h3 class="mt-3">${msg}</h3>
            <button onclick="closeQuiz()" class="btn btn-outline-dark rounded-pill px-4 mt-3">Đóng</button>
        </div>
    `;
    if (quizFooterEl) quizFooterEl.style.display = 'none';
}

function closeQuiz() {
    const quizModalEl = document.getElementById('quiz-modal');
    const quizFooterEl = document.querySelector('.quiz-footer');
    
    if (quizModalEl) quizModalEl.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (quizFooterEl) quizFooterEl.style.display = 'flex';
}

// === PHẦN 7: CONTACT FORM ===
const FEEDBACK_URL = "https://roadmapse.onrender.com/feedback";

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = this;
        const patterns = {
            name: /^[\p{L}\s]{3,50}$/u,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone:/^(0|\+84)(32|33|34|35|36|37|38|39|86|96|97|98|70|76|77|78|79|89|90|93|81|82|83|84|85|88|91|94|56|58|59)\d{7}$/,
            message: /^[\s\S]{10,500}$/
        };

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const messageInput = document.getElementById("message");
        const submitBtn = form.querySelector("button[type='submit']");

        if (!nameInput || !emailInput || !messageInput || !submitBtn) {
            console.error("Missing form elements");
            return;
        }

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

        if (phoneInput && phoneInput.value.trim()) {
            phoneInput.setCustomValidity(
                patterns.phone.test(phoneInput.value.trim())
                    ? ""
                    : "Phone must be belong to Vietnam mobile numbers"
            );
        } else if (phoneInput) {
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
            phone: phoneInput ? phoneInput.value.trim() : "",
            message: messageInput.value.trim()
        };

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';

            const res = await fetch(FEEDBACK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Server error");

            const result = await res.json();

            if (result.success) {
                const successMsg = document.getElementById("submitSuccessMessage");
                const errorMsg = document.getElementById("submitErrorMessage");
                
                if (successMsg) successMsg.classList.remove("d-none");
                if (errorMsg) errorMsg.classList.add("d-none");
                
                form.reset();
                form.classList.remove("was-validated");
                
                if (!successMsg) {
                    alert("✅ Cảm ơn bạn đã phản hồi!");
                }
            } else {
                throw new Error("Save failed");
            }

        } catch (err) {
            console.error("❌ Lỗi:", err);
            
            const errorMsg = document.getElementById("submitErrorMessage");
            if (errorMsg) {
                errorMsg.classList.remove("d-none");
            } else {
                alert("❌ Lỗi gửi thông tin. Vui lòng thử lại!");
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit';
        }
    });
}