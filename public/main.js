// Import Bootstrap's JavaScript
import '/assets/bootstrap/bootstrap.bundle.min.js';

// API endpoints
const API = {
    parts: '/api/inventory/parts',
    locations: '/api/inventory/locations',
    loanPart: (id) => `/api/inventory/parts/${id}/loan`,
    returnPart: (id) => `/api/inventory/parts/${id}/return`,
    deletePart: (id) => `/api/inventory/parts/${id}`
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

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createSafeElement(tag, textContent, attributes = {}) {
    const element = document.createElement(tag);
    if (textContent) {
        element.textContent = textContent;
    }
    Object.entries(attributes).forEach(([key, value]) => {
        if (key.startsWith('on')) return; // Don't allow event handlers
        element.setAttribute(key, value);
    });
    return element;
}

function renderParts() {
    const tbody = document.getElementById('partsList');
    tbody.innerHTML = ''; // Safe here as we're just clearing

    if (currentParts.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '10');
        td.className = 'text-center';
        td.textContent = 'No parts found';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    currentParts.forEach(part => {
        const tr = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = part.partName;
        tr.appendChild(nameCell);
        
        // Description cell with proper styling
        const descCell = document.createElement('td');
        descCell.className = 'text-wrap';
        descCell.style.maxWidth = '200px';
        const descSpan = document.createElement('span');
        descSpan.className = 'text-muted small';
        descSpan.textContent = part.partDescription || 'No description';
        descCell.appendChild(descSpan);
        tr.appendChild(descCell);
        
        // ID cell
        const idCell = document.createElement('td');
        idCell.textContent = part.partId || '';
        tr.appendChild(idCell);
        
        // Type cell
        const typeCell = document.createElement('td');
        typeCell.textContent = part.type || '';
        tr.appendChild(typeCell);
        
        // Location cell
        const locationCell = document.createElement('td');
        locationCell.textContent = part.locationName || '';
        tr.appendChild(locationCell);
        
        // Container cell
        const containerCell = document.createElement('td');
        containerCell.textContent = part.container || '';
        tr.appendChild(containerCell);
        
        // Row cell
        const rowCell = document.createElement('td');
        rowCell.textContent = part.row || '';
        tr.appendChild(rowCell);
        
        // Position cell
        const positionCell = document.createElement('td');
        positionCell.textContent = part.position || '';
        tr.appendChild(positionCell);
        
        // Quantity cell
        const quantityCell = document.createElement('td');
        quantityCell.textContent = part.quantity || '';
        tr.appendChild(quantityCell);
        
        // Status cell with badge
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge bg-${getStatusBadgeColor(part.status)}`;
        statusBadge.textContent = part.status;
        statusCell.appendChild(statusBadge);
        tr.appendChild(statusCell);
        
        // Actions cell with button group
        const actionsCell = document.createElement('td');
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        
        // Add appropriate action buttons based on status
        if (part.status === 'available') {
            const loanBtn = document.createElement('button');
            loanBtn.className = 'btn btn-sm btn-primary';
            loanBtn.textContent = 'Loan';
            loanBtn.onclick = () => openLoanModal(part.partId);
            btnGroup.appendChild(loanBtn);
        } else if (part.status === 'loaned') {
            const returnBtn = document.createElement('button');
            returnBtn.className = 'btn btn-sm btn-success';
            returnBtn.textContent = 'Return';
            returnBtn.onclick = () => returnPart(part.partId);
            btnGroup.appendChild(returnBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deletePart(part.partId);
        btnGroup.appendChild(deleteBtn);
        
        actionsCell.appendChild(btnGroup);
        tr.appendChild(actionsCell);
        
        tbody.appendChild(tr);
    });
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
        const response = await fetch(API.loanPart(selectedPartId), {
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
        const response = await fetch(API.returnPart(partId), {
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
        const response = await fetch(API.deletePart(partId), {
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
        
        // Clear existing options
        while (locationSelect.firstChild) {
            locationSelect.removeChild(locationSelect.firstChild);
        }
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a location';
        locationSelect.appendChild(defaultOption);
        
        // Add location options
        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.locationName;
            option.textContent = loc.locationName;
            locationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function handleLocationChange(e) {
    const locationName = e.target.value;
    const containerSelect = document.getElementById('containerName');
    
    // Clear existing options
    while (containerSelect.firstChild) {
        containerSelect.removeChild(containerSelect.firstChild);
    }
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a container';
    containerSelect.appendChild(defaultOption);
    
    if (!locationName) return;

    try {
        const response = await fetch(`${API.locations}?name=${encodeURIComponent(locationName)}`);
        const location = await response.json();
        
        if (location && location.container) {
            const option = document.createElement('option');
            option.value = location.container;
            option.textContent = location.container;
            containerSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading containers:', error);
    }
}