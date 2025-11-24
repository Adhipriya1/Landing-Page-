const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];
let currentPage = 1;
const usersPerPage = 3;

const userContainer = document.getElementById("userContainer");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");

/*=============== Fetch Data ===============*/
async function fetchUsers() {
    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    userContainer.innerHTML = "";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch users.");
        }

        users = await response.json();
        displayUsers();

    } catch (error) {
        errorMessage.textContent = "❌ Error: " + error.message + " | Check network!";
        errorBox.classList.remove("hidden");
    }

    loading.classList.add("hidden");
}

/*=============== Display Users ===============*/
function displayUsers() {
    userContainer.innerHTML = "";

    let filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    let start = (currentPage - 1) * usersPerPage;
    let paginatedUsers = filteredUsers.slice(start, start + usersPerPage);

    if (paginatedUsers.length === 0) {
        userContainer.innerHTML = "<p>No users found.</p>";
        return;
    }

    paginatedUsers.forEach(user => {
        const card = document.createElement("div");
        card.classList.add("user-card");

        card.innerHTML = `
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>City:</strong> ${user.address.city}</p>
            <p><strong>Street:</strong> ${user.address.street}</p>
        `;

        userContainer.appendChild(card);
    });
}

/*=============== Pagination ===============*/
document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage * usersPerPage < users.length) {
        currentPage++;
        displayUsers();
    }
});

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayUsers();
    }
});

/*=============== Reload Button ===============*/
document.getElementById("reloadBtn").addEventListener("click", () => {
    currentPage = 1;
    searchInput.value = "";
    fetchUsers();
});

/*=============== Search Filter ===============*/
searchInput.addEventListener("input", () => {
    currentPage = 1;
    displayUsers();
});

/*=============== Initial Load ===============*/
fetchUsers();
