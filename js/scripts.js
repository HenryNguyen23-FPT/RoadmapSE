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