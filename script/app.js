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
        paymentStatus.textContent = "Processing payment..."; // Initial message
        payHandler(phone, amount);
    });

    function payHandler(phone, amount) {
        axios.post("https://stk-push-murex.vercel.app/token", { // Use your actual domain
            amount: amount,
            phone: phone
        })
        .then(function(response) {
            paymentStatus.textContent = "STK Push sent. Please check your phone to complete the transaction.";
            console.log("Response:", response.data); // Log the response for debugging
        })
        .catch(function(error) {
            paymentStatus.textContent = "Error sending STK Push: " + error.message;
            console.log("Error:", error);
        });
    }

    // Function to listen for payment status updates
    function listenForPaymentStatus() {
        const eventSource = new EventSource('https://stk-push-murex.vercel.app/payment-status'); // Update to your actual domain
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.status) {
                paymentStatus.textContent = `Payment status: ${data.status}`;
            }
        };
    }

    listenForPaymentStatus(); // Call the function to start listening
});
