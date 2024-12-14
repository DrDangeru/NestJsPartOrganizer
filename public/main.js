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

// Initialize
loadParts();

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
            <td>${part.id}</td>
            <td>${part.type}</td>
            <td>${part.locationId}</td>
            <td><span class="badge bg-${getStatusBadgeColor(part.status)}">${part.status}</span></td>
            <td>
                <div class="btn-group">
                    ${part.status === 'available' 
                        ? `<button class="btn btn-sm btn-primary" onclick="openLoanModal('${part.id}')">Loan</button>`
                        : part.status === 'loaned'
                        ? `<button class="btn btn-sm btn-success" onclick="returnPart('${part.id}')">Return</button>`
                        : ''
                    }
                    <button class="btn btn-sm btn-danger" onclick="deletePart('${part.id}')">Delete</button>
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
        type: document.getElementById('partType').value,
        locationId: document.getElementById('locationId').value || generateId('loc'),
        locationName: document.getElementById('locationName').value,
        status: document.getElementById('status').value,
        partName: document.getElementById('partName').value
    };

    console.log(formData,'this is formdata');
    try {
        // First, ensure the location exists or create it
        const locationData = {
            locationName: formData.locationName,
            locationId: formData.locationId,
            container: null,
            row: null,
            position: null
        };

        console.log('Creating location with data:', locationData);

        const locationResponse = await fetch(API.locations, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(locationData) // using all the data ,  not just the partial
        });

        if (!locationResponse.ok) {
            const errorData = await locationResponse.json();
            console.error('Location creation error:', errorData);
            throw new Error(errorData.message || 'Failed to create location');
        }

        // Then create the part
        const response = await fetch(API.parts, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: formData.type,
                locationId: formData.locationId,
                status: formData.status,
                partName: formData.partName
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add part');
        }
        
        await loadParts(filterType.value);
        partForm.reset();
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