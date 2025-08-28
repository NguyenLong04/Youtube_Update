// Data versions as a JavaScript object (simulating a database)
// We will store new versions here to simulate persistence
let versions = [
    { version: 'v1.0.0', date: '2023-10-26', download_url: '#' },
    { version: 'v0.0.1', date: '2023-09-15', download_url: '#' }
];

// Global state and DOM elements
const DOMElements = {
    versionList: document.getElementById('version-list'),
    uploadForm: document.getElementById('upload-form'),
    versionInput: document.getElementById('versionInput'),
    fileInput: document.getElementById('fileInput'),
    uploadBtn: document.getElementById('upload-btn'),
    fileInfo: document.getElementById('file-info'),
    activityLog: document.getElementById('activity-log'),
    instructionModal: document.getElementById('instruction-modal'),
    modalContent: document.getElementById('modal-content'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    currentVersionDisplay: document.getElementById('current-version'),
};

/**
 * Renders the version list on the page.
 */
function renderVersions() {
    DOMElements.versionList.innerHTML = '';
    const sortedVersions = [...versions].sort((a, b) => {
        const aNum = parseFloat(a.version.substring(1));
        const bNum = parseFloat(b.version.substring(1));
        return bNum - aNum; // Sort descending
    });

    if (sortedVersions.length === 0) {
        DOMElements.versionList.innerHTML = `<p class="text-center text-gray-500 py-4">Chưa có bản cập nhật nào.</p>`;
        return;
    }

    sortedVersions.forEach(version => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-gray-700 border border-gray-600`;

        li.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="font-bold text-xl text-white">
                    Phiên bản ${version.version}
                </div>
                <div class="text-sm text-gray-400 mt-1">
                    Ngày phát hành: ${version.date}
                </div>
            </div>
            <a href="${version.download_url}" class="ml-4 py-2 px-6 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center">
                <i class="fas fa-download mr-2"></i> Tải xuống
            </a>
        `;
        DOMElements.versionList.appendChild(li);
    });
}

/**
 * Adds a new message to the activity log.
 * @param {string} message - The message to log.
 * @param {string} type - The type of message ('info' or 'error').
 */
function addLogMessage(message, type = 'info') {
    const logItem = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    logItem.className = `text-sm ${type === 'error' ? 'text-red-400' : 'text-gray-400'}`;
    logItem.textContent = `[${timestamp}] ${message}`;
    DOMElements.activityLog.prepend(logItem); // Add to the top
}

/**
 * Shows a custom modal with a title and content.
 * @param {string} title - The title of the modal.
 * @param {string} content - The HTML content of the modal.
 */
function showModal(title, content) {
    document.querySelector('#instruction-modal h3').textContent = title;
    DOMElements.modalContent.innerHTML = content;
    DOMElements.instructionModal.classList.remove('invisible', 'opacity-0');
    DOMElements.instructionModal.classList.add('visible', 'opacity-100');
}

/**
 * Hides the custom modal.
 */
function hideModal() {
    DOMElements.instructionModal.classList.remove('visible', 'opacity-100');
    DOMElements.instructionModal.classList.add('invisible', 'opacity-0');
}

/**
 * Displays information about the selected file.
 */
function displayFileInfo() {
    const file = DOMElements.fileInput.files[0];
    if (file) {
        DOMElements.fileInfo.innerHTML = `
            <p class="font-semibold text-gray-300">File đã chọn:</p>
            <p class="text-gray-400">Tên: ${file.name}</p>
            <p class="text-gray-400">Dung lượng: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
        DOMElements.uploadBtn.disabled = false;
        DOMElements.uploadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        DOMElements.fileInfo.innerHTML = 'Chưa có file nào được chọn.';
        DOMElements.uploadBtn.disabled = true;
        DOMElements.uploadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Event Listeners
DOMElements.uploadForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const version = DOMElements.versionInput.value.trim();
    const file = DOMElements.fileInput.files[0];

    if (!version || !file) {
        addLogMessage('Lỗi: Vui lòng nhập số phiên bản và chọn một file .zip.', 'error');
        showModal('Lỗi', '<p>Vui lòng nhập số phiên bản và chọn một file .zip để tải lên.</p>');
        return;
    }
    
    if (!file.name.endsWith('.zip')) {
        addLogMessage('Lỗi: File phải có định dạng .zip.', 'error');
        showModal('Lỗi', '<p>File phải có định dạng .zip.</p>');
        return;
    }

    // Simulate the upload process by adding to our in-memory array
    const newVersion = {
        version: version,
        date: new Date().toISOString().split('T')[0],
        download_url: '#' // Placeholder, as we can't save the file
    };

    versions.push(newVersion);
    addLogMessage(`Đã thêm phiên bản mới "${version}" vào danh sách.`);
    renderVersions();

    // Clear the form for the next upload
    DOMElements.versionInput.value = '';
    DOMElements.fileInput.value = '';
    displayFileInfo();
});

DOMElements.closeModalBtn.addEventListener('click', hideModal);
DOMElements.fileInput.addEventListener('change', displayFileInfo);

// Initial render on page load
document.addEventListener('DOMContentLoaded', () => {
    renderVersions();
    displayFileInfo(); // Initialize upload button state
    addLogMessage('Trang web đã tải xong.');
});
