document.addEventListener("DOMContentLoaded", function() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const purchasePage = document.getElementById("purchasePage");
    const phoneInput = document.getElementById("phoneInput");
    const amountInput = document.getElementById("amountInput");
    const payButton = document.getElementById("payButton");
    const paymentStatus = document.getElementById("paymentStatus");

    checkoutBtn.addEventListener('click', () => {
        purchasePage.style.display = "block";
        console.log('Checkout button clicked');
    });

    payButton.addEventListener("click", function(event) {
        event.preventDefault();
        const phone = phoneInput.value;
        const amount = document.getElementById("amt").innerText; // Get the amount from the span element
        payHandler(phone, amount);
    });

    function payHandler(phone, amount) {
        axios.post("http://localhost:5500/token", {
            amount: amount,
            phone: phone
        })
        .then(function(response) {
            paymentStatus.textContent = "STK Push sent. Please check your phone to complete the transaction.";
        })
        .catch(function(error) {
            paymentStatus.textContent = "Error sending STK Push: " + error.message;
            console.log(error);
        });
    }
});
