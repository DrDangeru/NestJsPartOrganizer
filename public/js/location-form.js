document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('locationForm');
    const alertArea = document.getElementById('alertArea');
    const locationList = document.getElementById('locationList');
    const showLocationsBtn = document.getElementById('showLocations');
    const partList = document.getElementById('partList');

    // Function to load and display locations
    async function loadLocations() {
        try {
            const response = await fetch('/api/inventory/locations');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locations = await response.json();
            
            // Clear existing locations
            if (locationList) {
                locationList.innerHTML = '';
                
                // Add each location to the table
                locations.forEach(location => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${location.locationName || ''}</td>
                        <td>${location.locationId || ''}</td>
                        <td>${location.container || ''}</td>
                        <td>${location.row || ''}</td>
                        <td>${location.position || ''}</td>
                    `;
                    locationList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading locations:', error);
            showAlert('Failed to load locations: ' + error.message, 'danger');
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
            
            // Clear existing parts
            if (partList) {
                partList.innerHTML = '';
                
                // Add each part to the table
                parts.forEach(part => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${part.partName || ''}</td>
                        <td>${part.id || ''}</td>
                        <td>${part.type || ''}</td>
                        <td>${part.status || ''}</td>
                        <td>${part.dateAdded || ''}</td>
                        <td>${part.quantity || ''}</td>
                    `;
                    partList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading parts:', error);
            showAlert('Failed to load parts: ' + error.message, 'danger');
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
            alertArea.innerHTML = '';

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
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertArea.appendChild(alertDiv);
    }
});
