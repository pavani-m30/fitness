const API = "http://127.0.0.1:5000/api";

// LOGIN
function login() {
    fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.role === "customer")
            window.location = "dashboard.html";
        else
            window.location = "dashboard.html";
    });
}

// LOAD POLICIES
function loadPolicies() {
    fetch(API + "/policies")
    .then(res => res.json())
    .then(data => {
        let html = "";
        data.forEach(p => {
            html += `<p>${p[1]} - ₹${p[3]}
                     <button onclick="buy(${p[0]}, ${p[3]})">Buy</button></p>`;
        });
        document.getElementById("list").innerHTML = html;
    });
}

// BUY
function buy(id, premium) {
    fetch(API + "/buy", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({policy_id: id, premium: premium})
    }).then(() => alert("Bought!"));
}

// PAYMENT
function pay() {
    fetch(API + "/pay", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({amount: 1000})
    }).then(() => alert("Paid"));
}

// CLAIM
function claim() {
    fetch(API + "/claim", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({policy_id: 1})
    }).then(() => alert("Claim submitted"));
}