const API_BASE = "/api";


// =====================================================
// NAVIGATION & INTERACTION
// =====================================================

function showSection(sectionId, button, shouldLoadData = true) {
    // Hide all sections
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active-section");
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    // Remove active state from all navigation buttons (both sub-nav and rail items)
    document.querySelectorAll(".sub-nav-item, .nav-item, .rail-item").forEach(item => {
        item.classList.remove("active");
    });

    // Keep the selected navigation item in sync with the active section.
    if (button && button.classList.contains("sub-nav-item")) {
        button.classList.add("active");
    }

    // Synchronize rail icons and sub-nav items
    const matchingSubNavItem = document.querySelector(`.sub-nav-item[onclick*="'${sectionId}'"]`);
    if ((!button || button.classList.contains("rail-item")) && matchingSubNavItem) {
        matchingSubNavItem.classList.add("active");
    }

    const matchingRailItem = document.querySelector(`.rail-item[onclick*="'${sectionId}'"]`);
    if (matchingRailItem) matchingRailItem.classList.add("active");

    // Page titles mapping
    const pageTitles = {
        reports: "Segregation Reports",
        dashboard: "Operations Dashboard",
        zones: "Collection Zones",
        householdCreate: "Add Household",
        households: "Household Records",
        schedules: "Collection Schedules",
        scheduleCreate: "Add Collection Schedule",
        pickups: "Pickup Logs",
        pickupCreate: "Add Pickup Log"
    };

    const title = pageTitles[sectionId] || "Workflow overview";

    const pageTitleElem = document.getElementById("pageTitle");
    if (pageTitleElem) pageTitleElem.textContent = title;

    const currentPageElem = document.getElementById("currentPage");
    if (currentPageElem) currentPageElem.textContent = title;

    // Trigger data fetch for sections
    if (!shouldLoadData) return;

    if (sectionId === "dashboard") {
        loadDashboard();
    } else if (sectionId === "zones") {
        loadZones();
    } else if (sectionId === "householdCreate") {
        loadHouseholdZones();
    } else if (sectionId === "households") {
        loadHouseholdFilterZones();
        loadHouseholds();
    } else if (sectionId === "schedules") {
        loadScheduleZones();
        loadSchedules();
    } else if (sectionId === "scheduleCreate") {
        loadScheduleZones();
    } else if (sectionId === "pickups") {
        loadPickups();
    } else if (sectionId === "pickupCreate") {
        loadPickupHouseholds();
    }
}

// Used by "View all" and shortcut buttons
function showSectionById(sectionId) {
    const button = document.querySelector(`.sub-nav-item[onclick*="'${sectionId}'"], .rail-item[onclick*="'${sectionId}'"]`);
    showSection(sectionId, button);
}

// Toggle collapsible sub-nav groups
function toggleNavGroup(element) {
    const childrenContainer = element.nextElementSibling;
    const chevron = element.querySelector(".chevron");
    if (childrenContainer) {
        if (childrenContainer.style.display === "none") {
            childrenContainer.style.display = "flex";
            if (chevron) chevron.classList.remove("rotate-down");
        } else {
            childrenContainer.style.display = "none";
            if (chevron) chevron.classList.add("rotate-down");
        }
    }
}

// Quick Create Modal Controls
function openCreateModal() {
    const modal = document.getElementById("createModal");
    if (modal) modal.classList.add("active");
}

function closeCreateModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById("createModal");
    if (modal) modal.classList.remove("active");
}


// =====================================================
// DASHBOARD DATA FETCHING
// =====================================================

async function loadDashboard() {
    try {
        const [zonesResponse, householdsResponse] = await Promise.all([
            fetch(`${API_BASE}/zones`),
            fetch(`${API_BASE}/households`)
        ]);

        if (!zonesResponse.ok || !householdsResponse.ok) {
            throw new Error("Unable to load dashboard data");
        }

        const [zones, households] = await Promise.all([
            zonesResponse.json(),
            householdsResponse.json()
        ]);

        // Total zones count
        const zoneCountElem = document.getElementById("dashboardZoneCount");
        if (zoneCountElem) zoneCountElem.textContent = zones.length;

        // Display zones list
        const container = document.getElementById("dashboardZones");
        if (container) {
            container.innerHTML = "";

            if (zones.length === 0) {
                container.innerHTML = `
                    <div class="empty-state-box" style="margin-top: 10px; padding: 20px;">
                        <span class="no-data-text">No zones registered</span>
                        <p class="no-data-sub">Create your first collection zone to get started.</p>
                    </div>
                `;
            } else {
                zones.slice(0, 5).forEach(zone => {
                    const row = document.createElement("div");
                    row.className = "zone-row";
                    row.innerHTML = `
                        <div>
                            <div class="zone-name">${escapeHtml(zone.name)}</div>
                            <div class="zone-id">Zone ID: ${zone.id}</div>
                        </div>
                        <span class="badge">Active</span>
                    `;
                    container.appendChild(row);
                });
            }
        }

        const householdCountElem = document.getElementById("dashboardHouseholdCount");
        if (householdCountElem) householdCountElem.textContent = households.length;

        const averageElem = document.getElementById("dashboardAverage");
        if (averageElem) averageElem.textContent = "—";

    } catch (error) {
        console.error("Dashboard error:", error);
        const container = document.getElementById("dashboardZones");
        if (container) {
            container.innerHTML = `
                <div class="empty-state-box" style="margin-top: 10px; padding: 20px;">
                    <span class="no-data-text" style="color: #ef4444;">Connection Error</span>
                    <p class="no-data-sub">Unable to connect to the backend API.</p>
                </div>
            `;
        }
    }
}


// =====================================================
// LOAD ZONES
// =====================================================

async function loadZones() {
    try {
        const response = await fetch(`${API_BASE}/zones`);

        if (!response.ok) {
            throw new Error("Unable to load zones");
        }

        const zones = await response.json();
        const table = document.getElementById("zonesTable");

        if (!table) return;
        table.innerHTML = "";

        if (zones.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">
                        No zones found in database.
                    </td>
                </tr>
            `;
            return;
        }

        zones.forEach(zone => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${zone.id}</td>
                <td><strong>${escapeHtml(zone.name)}</strong></td>
                <td><span class="badge">Active</span></td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Zone loading error:", error);
        const table = document.getElementById("zonesTable");
        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #ef4444; padding: 20px;">
                        Unable to connect to the backend.
                    </td>
                </tr>
            `;
        }
    }
}


// =====================================================
// ADD ZONE
// =====================================================

async function addZone() {
    const input = document.getElementById("zoneName");
    const message = document.getElementById("zoneMessage");

    if (!input || !message) return;

    const name = input.value.trim();

    if (!name) {
        message.textContent = "Zone name is required.";
        message.style.color = "#ef4444";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/zones`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Unable to create zone.";
            message.style.color = "#ef4444";
            return;
        }

        message.textContent = "Zone created successfully!";
        message.style.color = "#16a34a";

        input.value = "";

        await loadZones();
        await loadDashboard();

    } catch (error) {
        console.error("Add zone error:", error);
        message.textContent = "Unable to connect to the backend.";
        message.style.color = "#ef4444";
    }
}


// =====================================================
// LOAD HOUSEHOLDS
// =====================================================

async function loadHouseholdZones() {
    const select = document.getElementById("newHouseholdZone");
    if (!select) return;
    const setup = document.getElementById("householdZoneSetup");
    const setupText = document.getElementById("householdZoneSetupText");
    const setupAction = document.getElementById("householdZoneAction");

    if (setup) setup.hidden = true;
    select.disabled = true;
    select.innerHTML = '<option value="">Loading zones...</option>';

    try {
        const response = await fetch(`${API_BASE}/zones`);
        if (!response.ok) throw new Error("Unable to load zones");

        const zones = await response.json();
        select.innerHTML = '<option value="">Select a zone</option>';

        zones.forEach(zone => {
            const option = document.createElement("option");
            option.value = zone.id;
            option.textContent = `${zone.name} (ID: ${zone.id})`;
            select.appendChild(option);
        });

        if (zones.length === 0) {
            select.innerHTML = '<option value="">Create a zone first</option>';
            if (setup && setupText && setupAction) {
                setupText.textContent = "Create a collection zone before adding a household. ";
                setupAction.textContent = "Go to Zones";
                setupAction.onclick = () => showSectionById("zones");
                setup.hidden = false;
            }
        } else {
            select.disabled = false;
        }
    } catch (error) {
        console.error("Household zones loading error:", error);
        select.innerHTML = '<option value="">Unable to load zones</option>';
        if (setup && setupText && setupAction) {
            setupText.textContent = "Couldn't load collection zones. ";
            setupAction.textContent = "Retry";
            setupAction.onclick = loadHouseholdZones;
            setup.hidden = false;
        }
    }
}

async function loadHouseholdFilterZones() {
    const select = document.getElementById("householdFilterZoneId");
    if (!select) return;

    const selectedZoneId = select.value;
    try {
        const response = await fetch(`${API_BASE}/zones`);
        if (!response.ok) throw new Error("Unable to load zones");

        const zones = await response.json();
        select.innerHTML = '<option value="">All zones</option>';
        zones.forEach(zone => {
            const option = document.createElement("option");
            option.value = zone.id;
            option.textContent = `${zone.name} (ID: ${zone.id})`;
            select.appendChild(option);
        });
        if (zones.some(zone => String(zone.id) === selectedZoneId)) {
            select.value = selectedZoneId;
        }
    } catch (error) {
        console.error("Household filter zones loading error:", error);
        select.innerHTML = '<option value="">All zones</option>';
    }
}

async function addHousehold() {
    const nameInput = document.getElementById("newHouseholdName");
    const addressInput = document.getElementById("newHouseholdAddress");
    const zoneSelect = document.getElementById("newHouseholdZone");
    const message = document.getElementById("householdMessage");
    const submitButton = document.querySelector("#householdCreateForm button[type='submit']");

    if (!nameInput || !addressInput || !zoneSelect || !message) return;

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const zoneId = zoneSelect.value;

    if (!name || !address || !zoneId) {
        message.textContent = "Enter a household name and address, then select a zone.";
        message.style.color = "#ef4444";
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
    }
    message.textContent = "Saving household...";
    message.style.color = "#475569";

    try {
        const response = await fetch(`${API_BASE}/households/zone/${zoneId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, address })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            message.textContent = data.message || "Unable to create household.";
            message.style.color = "#ef4444";
            return;
        }

        message.textContent = "Household added successfully.";
        message.style.color = "#16a34a";
        nameInput.value = "";
        addressInput.value = "";

    } catch (error) {
        console.error("Add household error:", error);
        message.textContent = "Unable to connect to the backend.";
        message.style.color = "#ef4444";
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Add Household";
        }
    }
}

async function loadHouseholds() {
    const zoneSelect = document.getElementById("householdFilterZoneId");
    const table = document.getElementById("householdsTable");

    if (!table) return;

    const zoneId = zoneSelect ? zoneSelect.value : "";
    table.innerHTML = '<tr><td colspan="5" class="table-message">Loading households...</td></tr>';

    try {
        const url = zoneId
            ? `${API_BASE}/households/zone/${zoneId}`
            : `${API_BASE}/households`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load households");
        }

        table.innerHTML = "";

        if (data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="table-message">
                        ${zoneId ? `No households found for the selected zone.` : `No households registered yet. Use Add Household to create the first record.`}
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(household => {
            const row = document.createElement("tr");

            const status = household.flagged
                ? `<span class="badge" style="background:#fee2e2; color:#991b1b;">Flagged</span>`
                : `<span class="badge">Normal</span>`;

            row.innerHTML = `
                <td>${household.id}</td>
                <td><strong>${escapeHtml(household.name)}</strong></td>
                <td>${escapeHtml(household.address)}</td>
                <td>${household.zone ? `${escapeHtml(household.zone.name)} (ID: ${household.zone.id})` : "Unknown zone"}</td>
                <td>${status}</td>
            `;

            table.appendChild(row);
        });

    } catch (error) {
        console.error("Household loading error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="5" class="table-message error-message">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// LOAD SCHEDULES
// =====================================================

async function loadScheduleZones() {
    const selectors = [
        document.getElementById("scheduleZoneId"),
        document.getElementById("scheduleCreateZoneId")
    ].filter(Boolean);
    if (selectors.length === 0) return;

    const setup = document.getElementById("scheduleZoneSetup");
    const setupText = document.getElementById("scheduleZoneSetupText");
    const setupAction = document.getElementById("scheduleZoneAction");
    const selectedZoneIds = selectors.map(select => select.value);

    if (setup) setup.hidden = true;
    selectors.forEach(select => {
        select.disabled = true;
        select.innerHTML = '<option value="">Loading zones...</option>';
    });

    try {
        const response = await fetch(`${API_BASE}/zones`);
        if (!response.ok) throw new Error("Unable to load zones");

        const zones = await response.json();
        selectors.forEach((select, index) => {
            select.innerHTML = '<option value="">Select a zone</option>';
            zones.forEach(zone => {
                const option = document.createElement("option");
                option.value = zone.id;
                option.textContent = `${zone.name} (ID: ${zone.id})`;
                select.appendChild(option);
            });
            if (zones.some(zone => String(zone.id) === selectedZoneIds[index])) {
                select.value = selectedZoneIds[index];
            }
        });

        if (zones.length === 0) {
            selectors.forEach(select => {
                select.innerHTML = '<option value="">Create a zone first</option>';
            });
            if (setup && setupText && setupAction) {
                setupText.textContent = "Create a collection zone before adding a schedule. ";
                setupAction.textContent = "Go to Zones";
                setupAction.onclick = () => showSectionById("zones");
                setup.hidden = false;
            }
            return;
        }

        selectors.forEach(select => select.disabled = false);
        const recordsPage = document.getElementById("schedules");
        const filterZone = document.getElementById("scheduleZoneId");
        if (recordsPage?.classList.contains("active-section") && filterZone?.value) {
            await loadSchedules();
        }
    } catch (error) {
        console.error("Schedule zones loading error:", error);
        selectors.forEach(select => {
            select.innerHTML = '<option value="">Unable to load zones</option>';
        });
        if (setup && setupText && setupAction) {
            setupText.textContent = "Couldn't load collection zones. ";
            setupAction.textContent = "Retry";
            setupAction.onclick = loadScheduleZones;
            setup.hidden = false;
        }
    }
}

async function addSchedule() {
    const zoneSelect = document.getElementById("scheduleCreateZoneId");
    const daySelect = document.getElementById("scheduleCollectionDay");
    const startTimeInput = document.getElementById("scheduleStartTime");
    const endTimeInput = document.getElementById("scheduleEndTime");
    const message = document.getElementById("scheduleMessage");
    const submitButton = document.querySelector("#scheduleCreateForm button[type='submit']");

    if (!zoneSelect || !daySelect || !startTimeInput || !endTimeInput || !message) return;

    const zoneId = zoneSelect.value;
    const collectionDay = daySelect.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!zoneId || !collectionDay || !startTime || !endTime) {
        message.textContent = "Select a zone and day, then enter both pickup times.";
        message.style.color = "#ef4444";
        return;
    }

    if (startTime >= endTime) {
        message.textContent = "End time must be later than start time.";
        message.style.color = "#ef4444";
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
    }
    message.textContent = "Saving schedule...";
    message.style.color = "#475569";

    try {
        const response = await fetch(`${API_BASE}/schedules/zone/${zoneId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ collectionDay, startTime, endTime })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            message.textContent = data.message || "Unable to create schedule.";
            message.style.color = "#ef4444";
            return;
        }

        message.textContent = "Schedule saved successfully.";
        message.style.color = "#16a34a";
        daySelect.value = "";
        startTimeInput.value = "";
        endTimeInput.value = "";
        const recordsButton = Array.from(document.querySelectorAll(".sub-nav-item"))
            .find(item => item.getAttribute("onclick")?.includes("showSection('schedules'"));
        showSection("schedules", recordsButton, false);
        const filterZone = document.getElementById("scheduleZoneId");
        if (filterZone) filterZone.value = zoneId;
        await loadSchedules();
    } catch (error) {
        console.error("Add schedule error:", error);
        message.textContent = "Unable to connect to the backend.";
        message.style.color = "#ef4444";
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Add Schedule";
        }
    }
}

async function loadSchedules() {
    const zoneIdInput = document.getElementById("scheduleZoneId");
    const table = document.getElementById("schedulesTable");

    if (!zoneIdInput || !table) return;

    const zoneId = zoneIdInput.value.trim();

    if (!zoneId) {
        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">
                    Select a collection zone to view schedules.
                </td>
            </tr>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/schedules/zone/${zoneId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load schedules");
        }

        table.innerHTML = "";

        if (data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">
                        No schedules configured for Zone ID ${escapeHtml(zoneId)}.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(schedule => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${schedule.id}</td>
                <td><strong>${escapeHtml(schedule.collectionDay)}</strong></td>
                <td>${escapeHtml(schedule.startTime)}</td>
                <td>${escapeHtml(schedule.endTime)}</td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Schedule loading error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ef4444; padding: 20px;">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// LOAD PICKUP LOGS
// =====================================================

async function loadPickupHouseholds() {
    const select = document.getElementById("pickupCreateHouseholdId");
    if (!select) return;

    const setup = document.getElementById("pickupCreateSetup");
    const setupText = document.getElementById("pickupCreateSetupText");
    const setupAction = document.getElementById("pickupCreateSetupAction");
    if (setup) setup.hidden = true;
    select.disabled = true;
    select.innerHTML = '<option value="">Loading households...</option>';

    try {
        const response = await fetch(`${API_BASE}/households`);
        if (!response.ok) throw new Error("Unable to load households");

        const households = await response.json();
        select.innerHTML = '<option value="">Select a household</option>';
        households.forEach(household => {
            const option = document.createElement("option");
            option.value = household.id;
            const zoneName = household.zone ? household.zone.name : "Unknown zone";
            option.textContent = `${household.name} (ID: ${household.id}) - ${zoneName}`;
            select.appendChild(option);
        });

        if (households.length === 0) {
            select.innerHTML = '<option value="">Add a household first</option>';
            if (setup && setupText && setupAction) {
                setupText.textContent = "Register a household before recording a pickup. ";
                setupAction.textContent = "Add Household";
                setupAction.onclick = () => showSectionById("householdCreate");
                setup.hidden = false;
            }
            return;
        }

        select.disabled = false;
    } catch (error) {
        console.error("Pickup household loading error:", error);
        select.innerHTML = '<option value="">Unable to load households</option>';
        if (setup && setupText && setupAction) {
            setupText.textContent = "Couldn't load households. ";
            setupAction.textContent = "Retry";
            setupAction.onclick = loadPickupHouseholds;
            setup.hidden = false;
        }
    }
}

async function addPickupLog() {
    const householdSelect = document.getElementById("pickupCreateHouseholdId");
    const scoreInput = document.getElementById("pickupScore");
    const message = document.getElementById("pickupCreateMessage");
    const submitButton = document.querySelector("#pickupCreateForm button[type='submit']");

    if (!householdSelect || !scoreInput || !message) return;

    const householdId = householdSelect.value;
    const segregationScore = Number(scoreInput.value);

    if (!householdId || scoreInput.value === "" || !Number.isInteger(segregationScore) || segregationScore < 0 || segregationScore > 100) {
        message.textContent = "Select a household and enter a whole-number score from 0 to 100.";
        message.style.color = "#ef4444";
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
    }
    message.textContent = "Saving pickup log...";
    message.style.color = "#475569";

    try {
        const response = await fetch(`${API_BASE}/pickups/household/${householdId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ segregationScore })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            message.textContent = data.message || "Unable to record pickup.";
            message.style.color = "#ef4444";
            return;
        }

        message.textContent = "Pickup log saved successfully.";
        message.style.color = "#16a34a";
        scoreInput.value = "";
        const recordsButton = Array.from(document.querySelectorAll(".sub-nav-item"))
            .find(item => item.getAttribute("onclick")?.includes("showSection('pickups'"));
        showSection("pickups", recordsButton, false);
        const householdIdInput = document.getElementById("pickupHouseholdId");
        if (householdIdInput) householdIdInput.value = "";
        await loadPickups();
    } catch (error) {
        console.error("Add pickup error:", error);
        message.textContent = "Unable to connect to the backend.";
        message.style.color = "#ef4444";
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Save Pickup Log";
        }
    }
}

async function loadPickups() {
    const householdIdInput = document.getElementById("pickupHouseholdId");
    const table = document.getElementById("pickupsTable");

    if (!table) return;

    const householdId = householdIdInput ? householdIdInput.value.trim() : "";
    table.innerHTML = '<tr><td colspan="6" class="table-message">Loading pickup logs...</td></tr>';

    try {
        const url = householdId
            ? `${API_BASE}/pickups/household/${householdId}`
            : `${API_BASE}/pickups`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load pickup logs");
        }

        table.innerHTML = "";

        if (data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="table-message">
                        ${householdId ? `No pickup records found for Household ID ${escapeHtml(householdId)}.` : `No pickup logs have been recorded yet. Add a log during the selected household's scheduled pickup window.`}
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(pickup => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pickup.id}</td>
                <td><strong>${escapeHtml(pickup.household?.name || "Unknown household")}</strong> (ID: ${pickup.household?.id ?? "-"})</td>
                <td>${escapeHtml(pickup.household?.address || "-")}</td>
                <td>${escapeHtml(pickup.household?.zone?.name || "Unknown zone")}</td>
                <td>${formatDateTime(pickup.pickupTime)}</td>
                <td><strong style="color: #166534;">${pickup.segregationScore}</strong></td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Pickup loading error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="6" class="table-message error-message">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// ZONE AVERAGE REPORT
// =====================================================

async function loadZoneAverage() {
    const zoneIdInput = document.getElementById("reportZoneId");
    const result = document.getElementById("reportResult");

    if (!zoneIdInput || !result) return;

    const zoneId = zoneIdInput.value.trim();

    if (!zoneId) {
        result.innerHTML = `
            <span class="placeholder-text" style="color:#ef4444;">
                Enter a Zone ID to generate report.
            </span>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pickups/zone/${zoneId}/average`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to generate report");
        }

        const average = Number(data.zoneAverage).toFixed(2);

        result.innerHTML = `
            <div style="width: 100%;">
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Zone ${data.zoneId} Average Segregation Score
                </div>
                <div style="display: flex; align-items: baseline; gap: 10px;">
                    <strong style="font-size: 36px; font-weight: 800; color: #111827;">${average}</strong>
                    <span style="font-size: 13px; color: #22c55e; font-weight: 600;">/ 100 score</span>
                </div>
                <div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">
                    Calculated live from recorded household pickup logs
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Report error:", error);
        result.innerHTML = `
            <span style="color:#ef4444; font-size: 13px; font-weight: 500;">
                ${escapeHtml(error.message)}
            </span>
        `;
    }
}


// =====================================================
// FORMAT DATE / TIME
// =====================================================

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// INITIAL PAGE LOAD
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});