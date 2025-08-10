document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');
    const addStaffForm = document.getElementById('add-staff-form');
    const staffPhotoInput = document.getElementById('staff-photo');
    const photoPreview = document.getElementById('photo-preview');
    const staffListContainer = document.getElementById('staff-list-container');
    const staffDetailSection = document.getElementById('staff-detail-section');
    const backToViewStaffBtn = document.getElementById('back-to-view-staff');
    const detailStaffPhoto = document.getElementById('detail-staff-photo');
    const detailStaffNameSurname = document.getElementById('detail-staff-name-surname');
    const detailNameInput = document.getElementById('detail-name');
    const detailSurnameInput = document.getElementById('detail-surname');
    const detailEmailInput = document.getElementById('detail-email');
    const detailStatusSelect = document.getElementById('detail-status');
    const staffDetailForm = document.getElementById('staff-detail-form');
    const auditTableBody = document.querySelector('#audit-table tbody');

    // Simulate database for staff and audit logs
    let staffMembers = [];
    let auditLogs = [];
    let currentStaffId = null; // To keep track of which staff member is being edited

    // --- Navigation (Sidebar) ---
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all sidebar items and hide all sections
            sidebarItems.forEach(i => i.classList.remove('active'));
            contentSections.forEach(sec => sec.classList.remove('active'));

            // Add active class to clicked item and show target section
            item.classList.add('active');
            const targetId = item.dataset.target;
            document.getElementById(targetId).classList.add('active');

            // Specific actions for sections
            if (targetId === 'view-staff-section') {
                renderStaffList();
            } else if (targetId === 'audit-log-section') {
                renderAuditLog();
            }
            // Hide staff detail if navigating away
            staffDetailSection.classList.remove('active');
        });
    });

    // --- Add Staff Functionality ---
    photoPreview.addEventListener('click', () => {
        staffPhotoInput.click(); // Trigger hidden file input click
    });

    staffPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Staff Photo">`;
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.innerHTML = `<i class="fas fa-camera"></i><span>Upload Image</span>`;
        }
    });

    addStaffForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('staff-name').value.trim();
        const surname = document.getElementById('staff-surname').value.trim();
        const email = document.getElementById('staff-email').value.trim();
        const photoFile = staffPhotoInput.files[0];

        if (!name || !surname || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        const newStaff = {
            id: Date.now(), // Simple unique ID
            name: name,
            surname: surname,
            email: email,
            photo: photoFile ? URL.createObjectURL(photoFile) : 'https://via.placeholder.com/80/007bff/FFFFFF?text=NO+IMG', // Placeholder if no photo
            active: true // Default status
        };

        staffMembers.push(newStaff);
        logAudit('Admin', `Added new staff: ${name} ${surname}`);
        alert('Staff member added successfully!');
        addStaffForm.reset();
        photoPreview.innerHTML = `<i class="fas fa-camera"></i><span>Upload Image</span>`; // Reset photo preview
        renderStaffList(); // Update staff list immediately
    });

    // --- View Staff Functionality ---
    function renderStaffList() {
        staffListContainer.innerHTML = ''; // Clear previous list
        if (staffMembers.length === 0) {
            staffListContainer.innerHTML = '<p style="text-align: center; width: 100%;">No staff members added yet.</p>';
            return;
        }

        staffMembers.forEach(staff => {
            const staffCard = document.createElement('div');
            staffCard.classList.add('staff-card');
            staffCard.dataset.id = staff.id;
            staffCard.innerHTML = `
                <img src="${staff.photo}" alt="${staff.name} ${staff.surname}" class="staff-photo-icon">
                <h3>${staff.name} ${staff.surname}</h3>
                <p>${staff.active ? 'Active' : 'Inactive'}</p>
            `;
            staffCard.addEventListener('click', () => showStaffDetail(staff.id));
            staffListContainer.appendChild(staffCard);
        });
    }

    // --- Staff Detail and Modification ---
    function showStaffDetail(id) {
        const staff = staffMembers.find(s => s.id === id);
        if (!staff) return;

        currentStaffId = id;

        // Hide all sections, then show staff detail
        contentSections.forEach(sec => sec.classList.remove('active'));
        staffDetailSection.classList.add('active');

        detailStaffPhoto.src = staff.photo;
        detailStaffNameSurname.textContent = `${staff.name} ${staff.surname}`;
        detailNameInput.value = staff.name;
        detailSurnameInput.value = staff.surname;
        detailEmailInput.value = staff.email;
        detailStatusSelect.value = staff.active ? 'active' : 'inactive';

        logAudit('Admin', `Viewed staff details for ${staff.name} ${staff.surname}`);
    }

    staffDetailForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const updatedName = detailNameInput.value.trim();
        const updatedSurname = detailSurnameInput.value.trim();
        const updatedEmail = detailEmailInput.value.trim();
        const updatedStatus = detailStatusSelect.value === 'active';

        const staffIndex = staffMembers.findIndex(s => s.id === currentStaffId);
        if (staffIndex > -1) {
            const oldStaff = { ...staffMembers[staffIndex] }; // Copy for audit
            staffMembers[staffIndex].name = updatedName;
            staffMembers[staffIndex].surname = updatedSurname;
            staffMembers[staffIndex].email = updatedEmail;
            staffMembers[staffIndex].active = updatedStatus;

            // Log changes
            const changes = [];
            if (oldStaff.name !== updatedName) changes.push(`Name: ${oldStaff.name} -> ${updatedName}`);
            if (oldStaff.surname !== updatedSurname) changes.push(`Surname: ${oldStaff.surname} -> ${updatedSurname}`);
            if (oldStaff.email !== updatedEmail) changes.push(`Email: ${oldStaff.email} -> ${updatedEmail}`);
            if (oldStaff.active !== updatedStatus) changes.push(`Status: ${oldStaff.active ? 'Active' : 'Inactive'} -> ${updatedStatus ? 'Active' : 'Inactive'}`);

            if (changes.length > 0) {
                logAudit('Admin', `Modified staff ${updatedName} ${updatedSurname}. Changes: ${changes.join(', ')}`);
            } else {
                logAudit('Admin', `No changes made to staff ${updatedName} ${updatedSurname}.`);
            }

            alert('Staff information updated successfully!');
            renderStaffList(); // Re-render staff list to reflect changes
            // Optionally, return to view staff section after update
            sidebarItems.forEach(i => i.classList.remove('active'));
            document.querySelector('[data-target="view-staff-section"]').classList.add('active');
            contentSections.forEach(sec => sec.classList.remove('active'));
            document.getElementById('view-staff-section').classList.add('active');
        }
    });

    backToViewStaffBtn.addEventListener('click', () => {
        // Activate "View Staff" sidebar item
        sidebarItems.forEach(i => i.classList.remove('active'));
        document.querySelector('[data-target="view-staff-section"]').classList.add('active');

        // Show "View Staff" section and hide "Staff Detail"
        contentSections.forEach(sec => sec.classList.remove('active'));
        document.getElementById('view-staff-section').classList.add('active');
        renderStaffList(); // Ensure the list is up-to-date
    });

    // --- Audit Log Functionality ---
    function logAudit(user, action) {
        const timestamp = new Date().toLocaleString();
        auditLogs.unshift({ user, action, timestamp }); // Add to beginning for most recent first
        // Keep log size manageable for demo
        if (auditLogs.length > 50) {
            auditLogs.pop();
        }
        renderAuditLog(); // Update audit log display
    }

    function renderAuditLog() {
        auditTableBody.innerHTML = ''; // Clear existing logs
        if (auditLogs.length === 0) {
            const row = auditTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3;
            cell.textContent = 'No audit logs available.';
            cell.style.textAlign = 'center';
            return;
        }

        auditLogs.forEach(log => {
            const row = auditTableBody.insertRow();
            row.innerHTML = `
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.timestamp}</td>
            `;
        });
    }

    // Initial render when page loads
    renderStaffList();
    renderAuditLog();
    logAudit('Admin', 'Logged in to dashboard'); // Simulate initial login
});