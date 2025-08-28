// NOTE: To use this feature, you need to add a new div in your index.html:
// <div id="file-info" class="mt-4 text-center text-sm"></div>

// A simple function to simulate an API call with a delay
function mockApiCall(data) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, 1500); // Simulate network latency
    });
}

// Global state and DOM elements
const state = {
    currentVersion: '1.0.2',
    latestVersion: '',
    versions: [
        { id: 1, version: '1.0.0', date: '2023-10-26', changes: 'Phiên bản đầu tiên.' },
        { id: 2, version: '1.0.1', date: '2023-11-15', changes: 'Sửa lỗi nhỏ và cải thiện hiệu năng.' },
        { id: 3, version: '1.0.2', date: '2023-12-01', changes: 'Thêm tính năng cắt video và gộp audio.' },
    ],
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
    fileInfo: document.getElementById('file-info') // New element for file info
};

// Function to render the version list on the page
function renderVersions() {
    DOMElements.versionList.innerHTML = '';
    const sortedVersions = [...state.versions].reverse();

    sortedVersions.forEach(version => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm';
        li.innerHTML = `
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-lg text-gray-900">
                    Phiên bản ${version.version}
                </div>
                <div class="text-sm text-gray-500">
                    Ngày phát hành: ${version.date}
                </div>
            </div>
            <button class="ml-4 py-2 px-6 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-md">
                Tải xuống
            </button>
        `;
        DOMElements.versionList.appendChild(li);
    });
}

// Function to render the activity log
function addLogMessage(message, type = 'info') {
    const logItem = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    logItem.className = `text-sm ${type === 'error' ? 'text-red-600' : 'text-gray-600'}`;
    logItem.textContent = `[${timestamp}] ${message}`;
    DOMElements.activityLog.prepend(logItem); // Add to the top
    state.log.push(message); // Update state for record keeping
}

// Function to simulate fetching data with a delay
async function fetchAndRenderVersions() {
    DOMElements.loadingSpinner.classList.remove('hidden');
    const fetchedVersions = await mockApiCall(state.versions);
    DOMEElements.versions = fetchedVersions;
    DOMElements.loadingSpinner.classList.add('hidden');
    renderVersions();
}

// Function to show a custom modal
function showModal(title, content) {
    DOMElements.modalContent.innerHTML = content;
    DOMElements.instructionModal.classList.remove('hidden');
}

// Function to display selected file info
function displayFileInfo() {
    const file = DOMElements.fileInput.files[0];
    if (file) {
        DOMElements.fileInfo.innerHTML = `
            <p class="font-semibold text-gray-800">File đã chọn:</p>
            <p class="text-gray-600">Tên: ${file.name}</p>
            <p class="text-gray-600">Dung lượng: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
    } else {
        DOMElements.fileInfo.innerHTML = '';
    }
}

// Event Listeners
uploadForm.addEventListener('submit', function(event) {
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
            <li>Click vào mục <span class="font-mono bg-gray-200 rounded px-1 py-0.5">Releases</span>, sau đó click <span class="font-semibold text-indigo-600">"Create a new release"</span>.</li>
            <li>Đặt tên phiên bản mới (ví dụ: <span class="font-mono bg-gray-200 rounded px-1 py-0.5">v${state.latestVersion}</span>) và mô tả các thay đổi.</li>
            <li>Kéo và thả file <span class="font-semibold text-indigo-600">${file.name}</span> đã chọn vào phần "Attach binaries by dropping them here or selecting them".</li>
            <li>Nhấn nút <span class="font-semibold text-indigo-600">"Publish release"</span> để hoàn tất.</li>
            <li>Sau khi hoàn thành, ứng dụng của bạn sẽ có thể tự động tải bản cập nhật này.</li>
        </ol>
    `;

    showModal('Hoàn tất Tải lên', instructions);
});

closeModalBtn.addEventListener('click', function() {
    DOMElements.instructionModal.classList.add('hidden');
    DOMElements.modalContent.innerHTML = '';
});

checkUpdateButton.addEventListener('click', async function() {
    addLogMessage('Đang kiểm tra cập nhật...');
    // Simulate fetching latest version from a mock endpoint
    const latestVersion = await mockApiCall('1.0.3'); // Assume 1.0.3 is the latest
    state.latestVersion = latestVersion;

    // Compare versions (simplified)
    const currentVerNum = parseFloat(state.currentVersion.substring(1));
    const latestVerNum = parseFloat(latestVersion.substring(1));

    if (latestVerNum > currentVerNum) {
        addLogMessage(`Đã có phiên bản mới: ${latestVersion}. Vui lòng tải lên!`);
        showModal('Cập nhật mới!', `Đã có phiên bản mới: <b>${latestVersion}</b>. Vui lòng tải file zip của bạn lên để phát hành.`);
    } else {
        addLogMessage('Bạn đang sử dụng phiên bản mới nhất.', 'info');
        showModal('Phiên bản mới nhất', 'Bạn đang sử dụng phiên bản mới nhất.');
    }
});

// New event listener for file selection
fileInput.addEventListener('change', displayFileInfo);

// Initial render on page load
document.addEventListener('DOMContentLoaded', () => {
    DOMElements.currentVersionDisplay.textContent = state.currentVersion;
    addLogMessage('Trang web đã tải xong.');
    fetchAndRenderVersions();
});
