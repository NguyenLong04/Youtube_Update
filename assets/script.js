// Function to fetch data from a JSON file
async function fetchVersions() {
    try {
        const response = await fetch('version.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        addLogMessage(`Lỗi khi tải dữ liệu phiên bản: ${error.message}`, 'error');
        return { latestVersion: 'N/A', versions: [] }; // Return a default value in case of error
    }
}

// Global state and DOM elements
const state = {
    currentVersion: 'v0.0.1',
    latestVersion: '',
    versions: [],
    log: []
};

const DOMElements = {
    versionList: document.getElementById('version-list'),
    loadingSpinner: document.getElementById('loading-spinner'),
    uploadForm: document.getElementById('upload-form'),
    fileInput: document.getElementById('fileInput'),
    instructionModal: document.getElementById('instruction-modal'),
    modalContent: document.getElementById('modal-content'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    currentVersionDisplay: document.getElementById('current-version'),
    checkUpdateButton: document.getElementById('check-update-btn'),
    activityLog: document.getElementById('activity-log'),
    fileInfo: document.getElementById('file-info'),
    uploadButton: document.querySelector('#upload-form button[type="submit"]')
};

// Function to render the version list on the page
function renderVersions() {
    DOMElements.versionList.innerHTML = '';
    const sortedVersions = [...state.versions].sort((a, b) => {
        const aNum = parseFloat(a.version.substring(1));
        const bNum = parseFloat(b.version.substring(1));
        return bNum - aNum;
    });
    const latestVersion = state.latestVersion;

    if (sortedVersions.length === 0) {
        DOMElements.versionList.innerHTML = `<p class="text-center text-gray-500 py-4">Chưa có bản cập nhật nào.</p>`;
        return;
    }

    sortedVersions.forEach(version => {
        const isLatest = version.version === latestVersion;
        const li = document.createElement('li');
        
        li.className = `flex items-center justify-between p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${isLatest ? 'bg-indigo-600 border-2 border-indigo-400' : 'bg-gray-700 border border-gray-600'}`;

        li.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="font-bold text-xl text-white">
                    Phiên bản ${version.version}
                    ${isLatest ? '<span class="ml-3 px-3 py-1 text-sm font-semibold text-indigo-900 bg-indigo-300 rounded-full">Mới nhất</span>' : ''}
                </div>
                <div class="text-sm text-gray-400 mt-1">
                    Ngày phát hành: ${version.date}
                </div>
            </div>
            <a href="${version.download_url}" class="ml-4 py-2 px-6 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center download-btn">
                <i class="fas fa-download mr-2"></i> Tải xuống ${version.version}
            </a>
        `;
        DOMElements.versionList.appendChild(li);
    });
}

// Function to render the activity log
function addLogMessage(message, type = 'info') {
    const logItem = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    logItem.className = `text-sm ${type === 'error' ? 'text-red-400' : 'text-gray-400'}`;
    logItem.textContent = `[${timestamp}] ${message}`;
    DOMElements.activityLog.prepend(logItem);
    state.log.push(message);
}

// Function to show a custom modal
function showModal(title, content) {
    document.querySelector('#instruction-modal h3').textContent = title;
    DOMElements.modalContent.innerHTML = content;
    DOMElements.instructionModal.classList.remove('invisible', 'opacity-0');
    DOMElements.instructionModal.classList.add('visible', 'opacity-100');
}

// Function to hide the custom modal
function hideModal() {
    DOMElements.instructionModal.classList.remove('visible', 'opacity-100');
    DOMElements.instructionModal.classList.add('invisible', 'opacity-0');
}

// Function to display selected file info
function displayFileInfo() {
    const file = DOMElements.fileInput.files[0];
    if (file) {
        DOMElements.fileInfo.innerHTML = `
            <p class="font-semibold text-gray-300">File đã chọn:</p>
            <p class="text-gray-400">Tên: ${file.name}</p>
            <p class="text-gray-400">Dung lượng: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
        DOMElements.uploadButton.disabled = false;
        DOMElements.uploadButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        DOMElements.fileInfo.innerHTML = 'Chưa có file nào được chọn.';
        DOMElements.uploadButton.disabled = true;
        DOMElements.uploadButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Event Listeners
DOMElements.uploadForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const file = DOMElements.fileInput.files[0];

    if (!file) {
        addLogMessage('Lỗi: Vui lòng chọn một file .zip.', 'error');
        showModal('Lỗi', '<p>Vui lòng chọn một file .zip để tải lên.</p>');
        return;
    }

    if (!file.name.endsWith('.zip')) {
        addLogMessage('Lỗi: File phải có định dạng .zip.', 'error');
        showModal('Lỗi', '<p>File phải có định dạng .zip.</p>');
        return;
    }
    
    addLogMessage(`Đã chọn file: ${file.name}.`);

    const instructions = `
        <p class="font-bold">Hướng dẫn tạo bản phát hành trên GitHub:</p>
        <ol class="list-decimal list-inside text-sm space-y-2">
            <li>Đăng nhập vào tài khoản GitHub của bạn.</li>
            <li>Truy cập trang repository của bạn.</li>
            <li>Click vào mục <span class="font-mono bg-gray-600 text-gray-200 rounded px-1 py-0.5">Releases</span>, sau đó click <span class="font-semibold text-indigo-400">"Create a new release"</span>.</li>
            <li>Đặt tên phiên bản mới (ví dụ: <span class="font-mono bg-gray-600 text-gray-200 rounded px-1 py-0.5">${state.latestVersion}</span>) và mô tả các thay đổi.</li>
            <li>Kéo và thả file <span class="font-semibold text-indigo-400">${file.name}</span> đã chọn vào phần "Attach binaries by dropping them here or selecting them".</li>
            <li>Nhấn nút <span class="font-semibold text-indigo-400">"Publish release"</span> để hoàn tất.</li>
            <li>Sau khi hoàn thành, ứng dụng của bạn sẽ có thể tự động tải bản cập nhật này.</li>
        </ol>
    `;

    showModal('Hoàn tất Tải lên', instructions);
});

DOMElements.closeModalBtn.addEventListener('click', hideModal);

DOMElements.checkUpdateButton.addEventListener('click', async function() {
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang kiểm tra...';
    this.disabled = true;
    
    addLogMessage('Đang kiểm tra cập nhật...');
    
    try {
        const data = await fetchVersions();
        state.versions = data.versions;
        state.latestVersion = data.latestVersion;
        renderVersions();
    } catch (e) {
        addLogMessage('Không thể kiểm tra cập nhật.', 'error');
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
    }
    
    const currentVerNum = parseFloat(state.currentVersion.substring(1));
    const latestVerNum = parseFloat(state.latestVersion.substring(1));

    if (latestVerNum > currentVerNum) {
        addLogMessage(`Đã có phiên bản mới: ${state.latestVersion}. Vui lòng tải lên!`, 'info');
        showModal('Cập nhật mới!', `Đã có phiên bản mới: <b>${state.latestVersion}</b>. Vui lòng tải file zip của bạn lên để phát hành.`);
    } else {
        addLogMessage('Bạn đang sử dụng phiên bản mới nhất.', 'info');
        showModal('Phiên bản mới nhất', 'Bạn đang sử dụng phiên bản mới nhất.');
    }
});

DOMElements.fileInput.addEventListener('change', displayFileInfo);

document.addEventListener('DOMContentLoaded', async () => {
    DOMElements.currentVersionDisplay.textContent = state.currentVersion;
    addLogMessage('Trang web đã tải xong.');
    
    DOMElements.loadingSpinner.classList.remove('hidden');
    const data = await fetchVersions();
    state.versions = data.versions;
    state.latestVersion = data.latestVersion;
    DOMElements.loadingSpinner.classList.add('hidden');
    renderVersions();
});