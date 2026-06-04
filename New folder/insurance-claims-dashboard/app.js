document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'customer' && password === 'password') {
        alert('Customer login successful');
        document.getElementById('login').style.display = 'none';
        document.getElementById('create-claim').style.display = 'block';
    } else if (username === 'operations' && password === 'password') {
        alert('Operations login successful');
        document.getElementById('login').style.display = 'none';
        document.getElementById('claims').style.display = 'block';
        document.getElementById('sla').style.display = 'block';
    } else {
        alert('Invalid credentials');
    }
});

document.getElementById('claimForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const policyNumber = document.getElementById('policyNumber').value;
    const customerName = document.getElementById('customerName').value;
    const claimType = document.getElementById('claimType').value;
    const claimAmount = document.getElementById('claimAmount').value;

    const claimsTableBody = document.getElementById('claimsTableBody');
    const newRow = claimsTableBody.insertRow();

    newRow.innerHTML = `
        <td>${Math.floor(Math.random() * 10000)}</td>
        <td>${customerName}</td>
        <td>${policyNumber}</td>
        <td>${claimAmount}</td>
        <td>${claimType}</td>
        <td>Pending</td>
        <td>--</td>
    `;

    alert('Claim submitted successfully');
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('document');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const output = document.getElementById('documentOutput');
            output.innerHTML = `<p>Extracted Text: ${e.target.result}</p>`;
        };
        reader.readAsText(file);

        alert('Document uploaded successfully');
    } else {
        alert('Please select a file to upload');
    }
});

// Navigation logic
const sections = document.querySelectorAll('section');
const showSection = (id) => {
    sections.forEach(section => {
        section.style.display = section.id === id ? 'block' : 'none';
    });
};

// Example navigation setup
const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        showSection(targetId);
    });
});

// Vehicle Insurance Form Submission
const vehicleInsuranceForm = document.getElementById('vehicleInsuranceForm');
vehicleInsuranceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const vehicleType = document.getElementById('vehicleType').value;
    const rto = document.getElementById('rto').value;
    const city = document.getElementById('city').value;
    const brand = document.getElementById('brand').value;
    const model = document.getElementById('model').value;
    const variant = document.getElementById('variant').value;

    alert(`Vehicle Insurance Quote Requested:\nType: ${vehicleType}\nRTO: ${rto}\nCity: ${city}\nBrand: ${brand}\nModel: ${model}\nVariant: ${variant}`);
});

// Claims Submission
const submitClaimButton = document.getElementById('submitClaim');
submitClaimButton.addEventListener('click', () => {
    alert('Redirecting to claim submission form...');
});

// Operation Dashboard Logic
const kycList = document.getElementById('kycList');
const claimsManagementList = document.getElementById('claimsManagementList');

// Example data for KYC and claims
const exampleKYC = ['KYC Submission 1', 'KYC Submission 2'];
const exampleClaims = ['Claim 1', 'Claim 2'];

exampleKYC.forEach(kyc => {
    const li = document.createElement('li');
    li.textContent = kyc;
    kycList.appendChild(li);
});

exampleClaims.forEach(claim => {
    const li = document.createElement('li');
    li.textContent = claim;
    claimsManagementList.appendChild(li);
});