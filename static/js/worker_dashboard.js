/* =====================================================
   WORKER DASHBOARD JS (CLEANED & IMPROVED VERSION)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ================= VIEW ALL REQUESTS ================= */

    const viewAllBtn = document.getElementById("viewAllRequests");

    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", function () {

            const extraCards = document.querySelectorAll(".extra-request");

            extraCards.forEach(card => {
                card.classList.toggle("hidden");
            });

            this.textContent =
                this.textContent.trim() === "View All"
                    ? "Show Less"
                    : "View All";
        });
    }


    /* ================= ONLINE / OFFLINE ================= */

    const toggle = document.getElementById("onlineToggle");
    const statusText = document.getElementById("statusText");

    if (toggle && statusText) {
        toggle.addEventListener("change", function () {
            statusText.textContent = this.checked ? "Online" : "Offline";
        });
    }


    /* ================= CIRCULAR PROGRESS ================= */

    const circles = document.querySelectorAll(".circle");

    circles.forEach(circle => {
        const percent = parseInt(circle.dataset.percent) || 0;

        circle.style.background =
            `conic-gradient(#3b82f6 ${percent}%, #e2e8f0 ${percent}%)`;
    });


    /* ================= JOB HISTORY TABS ================= */

    const tabButtons = document.querySelectorAll(".tabs button");
    const historyRows = document.querySelectorAll("#historyTableBody tr");

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {

            tabButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");

            const selectedStatus = this.textContent.trim().toLowerCase();

            historyRows.forEach(row => {
                const rowStatus = row.dataset.status.toLowerCase();

                if (!selectedStatus || rowStatus === selectedStatus) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });


    /* ================= CALENDAR SYSTEM ================= */

    const modal = document.getElementById("calendarModal");
    const openCalendar = document.getElementById("openCalendar");
    const closeCalendar = document.getElementById("closeCalendar");
    const calendarGrid = document.getElementById("calendarGrid");
    const monthYearLabel = document.getElementById("calendarMonthYear");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const jobDetailsBox = document.getElementById("calendarJobDetails");

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    /* SAMPLE JOB DATA (Backend will replace later) */
    const jobs = [
        {
            work_type: "Bathroom Repair",
            customer: "Customer A",
            start: "2026-02-10",
            end: "2026-02-14"
        },
        {
            work_type: "Electrical Fix",
            customer: "Customer B",
            start: "2026-02-12",
            end: "2026-02-15"
        }
    ];


    function renderCalendar(year, month) {

        if (!calendarGrid) return;

        calendarGrid.innerHTML = "";
        if (jobDetailsBox) jobDetailsBox.innerHTML = "";

        if (monthYearLabel) {
            monthYearLabel.textContent = `${monthNames[month]} ${year}`;
        }

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendarGrid.appendChild(document.createElement("div"));
        }

        for (let day = 1; day <= totalDays; day++) {

            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().split("T")[0];

            let classes = "calendar-day";

            jobs.forEach(job => {

                if (dateStr >= job.start && dateStr <= job.end) {

                    if (dateStr === job.start) {
                        classes += " start-date";
                    }
                    else if (dateStr === job.end) {
                        classes += " end-date";
                    }
                    else {
                        classes += " middle-date";
                    }
                }
            });

            const dayDiv = document.createElement("div");
            dayDiv.className = classes;
            dayDiv.innerHTML = `<strong>${day}</strong>`;
            dayDiv.dataset.date = dateStr;

            dayDiv.addEventListener("click", function () {
                showJobsForDate(dateStr);
            });

            calendarGrid.appendChild(dayDiv);
        }
    }


    function showJobsForDate(dateStr) {

        if (!jobDetailsBox) return;

        jobDetailsBox.innerHTML = `<h4>Jobs on ${dateStr}</h4>`;

        const jobsOnDate = jobs.filter(job =>
            dateStr >= job.start && dateStr <= job.end
        );

        if (jobsOnDate.length === 0) {
            jobDetailsBox.innerHTML += "<p>No jobs on this day.</p>";
            return;
        }

        jobsOnDate.forEach(job => {
            jobDetailsBox.innerHTML += `
                <div class="calendar-job-item">
                    <strong>${job.work_type}</strong>
                    <p>Customer: ${job.customer}</p>
                    <p>${job.start} → ${job.end}</p>
                </div>
            `;
        });
    }


    /* MONTH NAVIGATION */

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentYear, currentMonth);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentYear, currentMonth);
        });
    }
/* ================= NEW JOB ACTIONS ================= */

document.querySelectorAll(".job-actions .primary").forEach(btn => {
    btn.addEventListener("click", function () {
        alert("Job Accepted");
    });
});

document.querySelectorAll(".job-actions .danger").forEach(btn => {
    btn.addEventListener("click", function () {
        alert("Job Declined");
    });
});

document.querySelectorAll(".job-actions .outline").forEach(btn => {
    btn.addEventListener("click", function () {
        alert("View Job Details");
    });
});
/* ================= ONGOING JOB ACTIONS ================= */

const openDetailsBtn = document.querySelector(".ongoing-card .outline");
const markCompleteBtn = document.querySelector(".ongoing-card .primary");

if (openDetailsBtn) {
    openDetailsBtn.addEventListener("click", function () {
        alert("Opening Job Details...");
    });
}

if (markCompleteBtn) {
    markCompleteBtn.addEventListener("click", function () {
        alert("Job Marked Completed");
    });
}
    /* MODAL CONTROL (Better Way) */

    if (openCalendar && modal) {
        openCalendar.addEventListener("click", function () {
            modal.style.display = "flex";
            renderCalendar(currentYear, currentMonth);
        });
    }

    if (closeCalendar && modal) {
        closeCalendar.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

});

/* =====================================================
   BACKEND DYNAMIC DASHBOARD DATA
   ===================================================== */

async function loadWorkerDashboard() {
    try {
        const res = await fetch("/api/worker/dashboard");
        const data = await res.json();

        console.log("Worker dashboard:", data);
        renderWorkerStats(data);
        renderRecentChats(data.recent_chats || []);
        renderIncomingJobs(data.incoming_jobs || []);
        renderOngoingJobs(data.ongoing_jobs || []);
        renderHistory(data.job_history || []);
    } catch (err) {
        console.error("Dashboard load failed:", err);
    }
}

/* ================= INCOMING REQUESTS ================= */

function renderIncomingJobs(jobs) {
    const container = document.getElementById("incomingRequests");
    if (!container) return;

    container.innerHTML = "";

    if (!jobs.length) {
        container.innerHTML = "<p>No new requests</p>";
        return;
    }

    jobs.forEach(job => {
        container.innerHTML += `
            <div class="job-card">
                <h4>${job.jobTitle}</h4>
                <p>${job.description}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Customer:</strong> ${job.customerName}</p>
                <div class="job-actions">
                    <button class="primary" onclick="acceptJob('${job.id}')">Accept</button>
                    <button class="danger" onclick="declineJob('${job.id}')">Decline</button>
                    <button class="outline">View</button>
                </div>
            </div>
        `;
    });
}

/* ================= ONGOING JOB ================= */

function renderOngoingJobs(jobs) {
    const box = document.getElementById("ongoingJobBox");
    if (!box) return;

    if (!jobs.length) {
        box.innerHTML = "<p>No active jobs</p>";
        return;
    }

    const job = jobs[0];

    box.innerHTML = `
        <h4>${job.jobTitle}</h4>
        <p>${job.description}</p>\
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Customer:</strong> ${job.customerName}</p>
        

        <div class="job-actions">
            <button class="outline">Details</button>
            <button class="primary" onclick="completeJob('${job.id}')">Mark Complete</button>
        </div>
    `;
}

/* ================= JOB HISTORY ================= */

function renderHistory(history) {
    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    history.forEach(job => {
        tbody.innerHTML += `
            <tr data-status="${job.status}">
                <td>${job.work_type}</td>
                <td>${job.customer_name}</td>
                <td>${job.status}</td>
                <td>${new Date(job.completedAt).toLocaleDateString()}</td>
            </tr>
        `;
    });
}
/* ================= WORKER STATS ================= */

function renderWorkerStats(data) {

    const activeEl = document.getElementById("activeJobsCount");
    const ratingEl = document.getElementById("workerRating");

    if (activeEl) {
        activeEl.textContent = data.active_jobs_count || 0;
    }

    if (ratingEl) {
        const rating = data.rating || 0;
        ratingEl.textContent = Number(rating).toFixed(1);
    }
}
/* ================= ACTION BUTTONS ================= */

function acceptJob(id) {
    res= fetch(`/api/worker/job/${id}/accept`, { method: "POST" });
    if(res.ok) {
        loadWorkerDashboard();
        window.location.href = `/dashboard`;
    }
}

function declineJob(id) {
    res= fetch(`/api/worker/job/${id}/decline`, { method: "POST" });
    if(res.ok) {
        loadWorkerDashboard();
        window.location.href = `/dashboard`;
    }
}

function completeJob(id) {
    res= fetch(`/api/worker/job/${id}/complete`, { method: "POST" });
    if(res.ok) {
        loadWorkerDashboard();
        window.location.href = `/dashboard`;
    }
}
function openChat(chatId) {
    window.location.href = `/inbox?cid=${chatId}`;
}
function renderRecentChats(chats) {
    const container = document.getElementById("recentChatsContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!chats.length) {
        container.innerHTML = "<p>No recent chats</p>";
        return;
    }

    chats.forEach(chat => {

        const time = chat.last_message_time
            ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "";

        container.innerHTML += `
            <div class="chat-item" onclick="openChat('${chat.chatId}')">

                <div class="chat-avatar">
                    ${chat.customer_photo 
                        ? `<img src="${chat.customer_photo}" />`
                        : "👤"}
                </div>

                <div class="chat-info">
                    <strong>${chat.customer_name || "Customer"}</strong>
                    <p>${chat.last_message || ""}</p>
                </div>

                <div class="chat-time">${time}</div>

            </div>
        `;
    });
}
/* ================= WORK LOCATION UPDATE ================= */

let workerMap;
let newLat = null;
let newLng = null;

document.addEventListener("DOMContentLoaded", function(){

    const modal = document.getElementById("locationModal");
    const openBtn = document.getElementById("updateLocationBtn");
    const closeBtn = document.getElementById("closeLocationModal");
    const saveBtn = document.getElementById("saveWorkerLocation");

    if(openBtn){
        openBtn.addEventListener("click", function(){
            modal.style.display = "flex";

            setTimeout(() => {

                if(!workerMap){
                    workerMap = L.map("workerLocationMap")
                        .setView([22.5726, 88.3639], 13);

                    L.tileLayer(
                        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        { maxZoom: 19 }
                    ).addTo(workerMap);

                    workerMap.on("click", function(e){
                        newLat = e.latlng.lat;
                        newLng = e.latlng.lng;

                        L.marker([newLat, newLng])
                            .addTo(workerMap)
                            .bindPopup("Selected Location")
                            .openPopup();
                    });
                }

                workerMap.invalidateSize();

            },200);
        });
    }

    if(closeBtn){
        closeBtn.addEventListener("click", function(){
            modal.style.display = "none";
        });
    }

    if(saveBtn){
        saveBtn.addEventListener("click", async function(){

            if(!newLat || !newLng){
                alert("Please select a location on map.");
                return;
            }

            const res = await fetch("/api/worker/update-location",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    lat: newLat,
                    lng: newLng
                })
            });

            if(res.ok){
                alert("Location Updated Successfully ✅");
                modal.style.display = "none";
            } else {
                alert("Failed to update location");
            }

        });
    }

});
/* ================= AUTO LOAD ================= */

document.addEventListener("DOMContentLoaded", loadWorkerDashboard);