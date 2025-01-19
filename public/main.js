// API endpoints
const API = {
    parts: '/api/inventory/parts',
    locations: '/api/inventory/locations',
    loan: (id) => `/api/inventory/parts/${id}/loan`,
    return: (id) => `/api/inventory/parts/${id}/return`
};

// Helper function to generate IDs
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// State management
let currentParts = [];
let selectedPartId = null;

// DOM Elements
const partForm = document.getElementById('partForm');
const partsList = document.getElementById('partsList');
const filterType = document.getElementById('filterType');
const loanModal = new bootstrap.Modal(document.getElementById('loanModal'));
const loanForm = document.getElementById('loanForm');
const confirmLoanBtn = document.getElementById('confirmLoan');

// Event Listeners
partForm.addEventListener('submit', handleAddPart);
filterType.addEventListener('change', handleFilterChange);
confirmLoanBtn.addEventListener('click', handleLoanPart);

// Add location change listener
document.getElementById('locationName').addEventListener('change', handleLocationChange);

// Initialize
loadParts();
loadLocations();

// Functions
async function loadParts(type = '') {
    try {
        const url = type ? `${API.parts}?type=${type}` : API.parts;
        const response = await fetch(url);
        currentParts = await response.json();
        renderParts();
    } catch (error) {
        console.error('Error loading parts:', error);
        alert('Failed to load parts');
    }
}

function renderParts() { 
    partsList.innerHTML = currentParts.map(part => `
        <tr>
            <td>${part.partName}</td>
            <td class="text-wrap" style="max-width: 200px;">
                ${part.partDescription ? 
                    `<span class="text-muted small">${part.partDescription}</span>` : 
                    '<span class="text-muted small">No description</span>'
                }
            </td>
            <td>${part.partId}</td>
            <td>${part.type}</td>
            <td>${part.locationName || ''}</td>
            <td>${part.container || ''}</td>
            <td>${part.row || ''}</td>
            <td>${part.position || ''}</td>
            <td>${part.quantity}</td>
            <td><span class="badge bg-${getStatusBadgeColor(part.status)}">${part.status}</span></td>
            <td>
                <div class="btn-group">
                    ${part.status === 'available' 
                        ? `<button class="btn btn-sm btn-primary" onclick="openLoanModal('${part.partId}')">Loan</button>`
                        : part.status === 'loaned'
                        ? `<button class="btn btn-sm btn-success" onclick="returnPart('${part.partId}')">Return</button>`
                        : ''
                    }
                    <button class="btn btn-sm btn-danger" onclick="deletePart('${part.partId}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusBadgeColor(status) {
    const colors = {
        available: 'success',
        loaned: 'warning',
        maintenance: 'info',
        disposed: 'danger'
    };
    return colors[status] || 'secondary';
}

async function handleAddPart(e) {
    e.preventDefault();
    const formData = {
        partName: document.getElementById('partName').value,
        partDescription: document.getElementById('partDescription').value.trim() || null,
        type: document.getElementById('partType').value,
        locationName: document.getElementById('locationName').value,
        container: document.getElementById('containerName').value,
        row: document.getElementById('row').value ? parseInt(document.getElementById('row').value) : null,
        position: document.getElementById('position').value || null,
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        status: document.getElementById('status').value
    };

    try {
        const response = await fetch(API.parts, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create part');
        }

        // Reset form
        document.getElementById('partForm').reset();
        
        // Clear description field (since it's not a standard form input)
        document.getElementById('partDescription').value = '';
        
        // Reload parts
        await loadParts();
    } catch (error) {
        console.error('Error adding part:', error);
        alert(error.message || 'Failed to add part');
    }
}

function handleFilterChange() {
    loadParts(filterType.value);
}

function openLoanModal(partId) {
    selectedPartId = partId;
    loanModal.show();
}

async function handleLoanPart() {
    if (!selectedPartId) return;

    const loanData = {
        loanedTo: document.getElementById('loanedTo').value,
        expectedReturn: document.getElementById('expectedReturn').value || undefined
    };

    try {
        const response = await fetch(API.loan(selectedPartId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loanData)
        });

        if (!response.ok) throw new Error('Failed to loan part');

        loanModal.hide();
        loanForm.reset();
        loadParts(filterType.value);
    } catch (error) {
        console.error('Error loaning part:', error);
        alert('Failed to loan part');
    }
}

async function returnPart(partId) {
    try {
        const response = await fetch(API.return(partId), {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to return part');

        loadParts(filterType.value);
    } catch (error) {
        console.error('Error returning part:', error);
        alert('Failed to return part');
    }
}

async function deletePart(partId) {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
        const response = await fetch(`${API.parts}/${partId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete part');

        loadParts(filterType.value);
    } catch (error) {
        console.error('Error deleting part:', error);
        alert('Failed to delete part');
    }
}

async function loadLocations() {
    try {
        const response = await fetch(API.locations);
        const locations = await response.json();
        const locationSelect = document.getElementById('locationName');
        locationSelect.innerHTML = '<option value="">Select a location</option>' + 
            locations.map(loc => `<option value="${loc.locationName}">${loc.locationName}</option>`).join('');
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function handleLocationChange(e) {
    const locationName = e.target.value;
    const containerSelect = document.getElementById('containerName');
    containerSelect.innerHTML = '<option value="">Select a container</option>';
    
    if (!locationName) return;

    try {
        const response = await fetch(`${API.locations}?name=${locationName}`);
        const location = await response.json();
        
        if (location && location.container) {
            containerSelect.innerHTML += `<option value="${location.container}">${location.container}</option>`;
        }
    } catch (error) {
        console.error('Error loading containers:', error);
    }
}