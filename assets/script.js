// Data versions as a JavaScript object (simulating a database)
// We will store new versions here and persist them to Local Storage
let versions = [];

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

    sortedVersions.forEach((version, index) => {
        const li = document.createElement('li');
        li.className = `flex flex-col md:flex-row items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-gray-700 border border-gray-600`;

        li.innerHTML = `
            <div class="flex-1 min-w-0 mb-4 md:mb-0">
                <div class="font-bold text-xl text-white">
                    Phiên bản ${version.version}
                </div>
                <div class="text-sm text-gray-400 mt-1">
                    Ngày phát hành: ${version.date}
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="edit-btn py-2 px-4 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center" data-index="${index}">
                    <i class="fas fa-edit mr-2"></i> Sửa
                </button>
                <button class="delete-btn py-2 px-4 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center" data-index="${index}">
                    <i class="fas fa-trash-alt mr-2"></i> Xóa
                </button>
                <a href="${version.download_url}" class="py-2 px-4 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center">
                    <i class="fas fa-download mr-2"></i> Tải xuống
                </a>
            </div>
        `;
        DOMElements.versionList.appendChild(li);
    });

    // Add event listeners for new buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.currentTarget.getAttribute('data-index');
            editVersion(index);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.currentTarget.getAttribute('data-index');
            deleteVersion(index);
        });
    });
}

/**
 * Saves the versions array to Local Storage.
 */
function saveVersions() {
    try {
        localStorage.setItem('youtube_versions', JSON.stringify(versions));
        addLogMessage('Đã lưu dữ liệu vào bộ nhớ cục bộ.');
    } catch (e) {
        addLogMessage('Lỗi khi lưu dữ liệu vào bộ nhớ cục bộ.', 'error');
    }
}

/**
 * Loads the versions array from Local Storage.
 */
function loadVersions() {
    try {
        const storedVersions = localStorage.getItem('youtube_versions');
        if (storedVersions) {
            versions = JSON.parse(storedVersions);
            addLogMessage('Đã tải dữ liệu từ bộ nhớ cục bộ.');
        } else {
            // Initialize with default data if no data is found
            versions = [
                { version: 'v1.0.0', date: '2023-10-26', download_url: '#' },
                { version: 'v0.0.1', date: '2023-09-15', download_url: '#' }
            ];
            saveVersions();
            addLogMessage('Khởi tạo dữ liệu mặc định.');
        }
    } catch (e) {
        addLogMessage('Lỗi khi tải dữ liệu từ bộ nhớ cục bộ, sử dụng dữ liệu mặc định.', 'error');
        versions = [
            { version: 'v1.0.0', date: '2023-10-26', download_url: '#' },
            { version: 'v0.0.1', date: '2023-09-15', download_url: '#' }
        ];
    }
}

/**
 * Edits a version by its index.
 * @param {number} index - The index of the version to edit.
 */
function editVersion(index) {
    const oldVersion = versions[index];
    showModal('Chỉnh sửa Phiên bản', `
        <p>Phiên bản cũ: <strong>${oldVersion.version}</strong></p>
        <div class="mt-4">
            <label for="editVersionInput" class="block text-sm font-medium text-gray-300 mb-1">Phiên bản mới:</label>
            <input type="text" id="editVersionInput" value="${oldVersion.version}" class="w-full p-2 rounded-lg bg-gray-600 border border-gray-500 text-white">
        </div>
        <div class="mt-4 flex space-x-2">
            <button id="saveEditBtn" class="py-2 px-4 rounded-xl text-white bg-green-500 hover:bg-green-600 transition-colors duration-200">Lưu</button>
            <button id="cancelEditBtn" class="py-2 px-4 rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200">Hủy</button>
        </div>
    `);

    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const newVersionInput = document.getElementById('editVersionInput').value.trim();
        if (newVersionInput) {
            versions[index].version = newVersionInput;
            addLogMessage(`Đã cập nhật phiên bản từ "${oldVersion.version}" thành "${newVersionInput}".`);
            renderVersions();
            saveVersions();
            hideModal();
        } else {
            addLogMessage('Lỗi: Phiên bản không được để trống.', 'error');
            alert('Phiên bản không được để trống.'); // Use a simple alert for quick feedback in this mock
        }
    });

    document.getElementById('cancelEditBtn').addEventListener('click', hideModal);
}

/**
 * Deletes a version by its index.
 * @param {number} index - The index of the version to delete.
 */
function deleteVersion(index) {
    const versionToDelete = versions[index];
    showModal('Xác nhận Xóa', `
        <p>Bạn có chắc chắn muốn xóa phiên bản **${versionToDelete.version}** không? Hành động này không thể hoàn tác.</p>
        <div class="mt-6 flex justify-end space-x-2">
            <button id="confirmDeleteBtn" class="py-2 px-4 rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors duration-200">Xác nhận</button>
            <button id="cancelDeleteBtn" class="py-2 px-4 rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200">Hủy</button>
        </div>
    `);

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        versions.splice(index, 1);
        addLogMessage(`Đã xóa phiên bản "${versionToDelete.version}".`);
        renderVersions();
        saveVersions();
        hideModal();
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', hideModal);
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
        download_url: `download/${version}/${file.name}`
    };

    versions.push(newVersion);
    addLogMessage(`Đã thêm phiên bản mới "${version}" với đường dẫn ${newVersion.download_url}.`);
    renderVersions();
    saveVersions(); // Save the updated array to Local Storage

    // Clear the form for the next upload
    DOMElements.versionInput.value = '';
    DOMElements.fileInput.value = '';
    displayFileInfo();
});

DOMElements.closeModalBtn.addEventListener('click', hideModal);
DOMElements.fileInput.addEventListener('change', displayFileInfo);

// Initial render on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVersions(); // Load data from Local Storage first
    renderVersions();
    displayFileInfo(); // Initialize upload button state
    addLogMessage('Trang web đã tải xong.');
});
