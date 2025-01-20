document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('locationForm');
    const alertArea = document.getElementById('alertArea');
    const locationList = document.getElementById('locationList');
    const showLocationsBtn = document.getElementById('showLocations');
    const partList = document.getElementById('partList');

    // Utility functions
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

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Function to load and display locations
    async function loadLocations() {
        try {
            const response = await fetch('/api/inventory/locations');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locations = await response.json();
            
            clearElement(locationList);
            
            if (locations.length === 0) {
                const emptyMessage = createSafeElement('div', 'No locations found', {
                    class: 'alert alert-info'
                });
                locationList.appendChild(emptyMessage);
                return;
            }

            locations.forEach(location => {
                const row = createSafeElement('tr', null);
                
                const nameEl = createSafeElement('td', location.locationName || '');
                const idEl = createSafeElement('td', location.locationId || '');
                const containerEl = createSafeElement('td', location.container || '');
                const rowEl = createSafeElement('td', location.row || '');
                const positionEl = createSafeElement('td', location.position || '');
                
                row.appendChild(nameEl);
                row.appendChild(idEl);
                row.appendChild(containerEl);
                row.appendChild(rowEl);
                row.appendChild(positionEl);
                locationList.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading locations:', error);
            clearElement(locationList);
            const errorMessage = createSafeElement('div', 'Error loading locations', {
                class: 'alert alert-danger'
            });
            locationList.appendChild(errorMessage);
        }
    }

    // Function to load and display parts
    async function loadParts() {
        try {
            const response = await fetch('/api/inventory/all-parts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const parts = await response.json();
            
            clearElement(partList);
            
            if (parts.length === 0) {
                const emptyMessage = createSafeElement('div', 'No parts found', {
                    class: 'alert alert-info'
                });
                partList.appendChild(emptyMessage);
                return;
            }

            parts.forEach(part => {
                const row = createSafeElement('tr', null);
                
                const nameEl = createSafeElement('td', part.partName || '');
                const idEl = createSafeElement('td', part.id || '');
                const typeEl = createSafeElement('td', part.type || '');
                const statusEl = createSafeElement('td', part.status || '');
                const dateAddedEl = createSafeElement('td', part.dateAdded || '');
                const quantityEl = createSafeElement('td', part.quantity || '');
                
                row.appendChild(nameEl);
                row.appendChild(idEl);
                row.appendChild(typeEl);
                row.appendChild(statusEl);
                row.appendChild(dateAddedEl);
                row.appendChild(quantityEl);
                partList.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading parts:', error);
            clearElement(partList);
            const errorMessage = createSafeElement('div', 'Error loading parts', {
                class: 'alert alert-danger'
            });
            partList.appendChild(errorMessage);
        }
    }

    // Load locations when clicking the show locations button
    if (showLocationsBtn) {
        showLocationsBtn.addEventListener('click', loadLocations);
    }

    // Initial load of locations and parts
    loadLocations();
    loadParts();

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous alerts
            clearElement(alertArea);

            // Get form data
            const locationData = {
                locationName: document.getElementById('locationName').value,
                locationId: document.getElementById('locationId').value || undefined,
                container: document.getElementById('container').value || undefined,
                row: document.getElementById('row').value ? parseInt(document.getElementById('row').value) : undefined,
                position: document.getElementById('position').value || undefined
            };

            try {
                const response = await fetch('/api/inventory/locations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(locationData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                showAlert('Location added successfully!', 'success');
                form.reset();
                
                // Reload the locations table
                loadLocations();

            } catch (error) {
                console.error('Error:', error);
                showAlert('Failed to add location: ' + error.message, 'danger');
            }
        });
    }

    function showAlert(message, type) {
        const alertArea = document.getElementById('alertArea');
        clearElement(alertArea);
        
        const alert = createSafeElement('div', message, {
            class: `alert alert-${type} alert-dismissible fade show`,
            role: 'alert'
        });
        
        const closeButton = createSafeElement('button', '×', {
            class: 'close',
            'data-dismiss': 'alert',
            'aria-label': 'Close'
        });
        
        alert.appendChild(closeButton);
        alertArea.appendChild(alert);
    }
});
