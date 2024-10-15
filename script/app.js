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
            if (!response.data.transactionId) {
                throw new Error("Transaction ID not found in response.");
            }

            paymentStatus.textContent = "STK Push sent. Please check your phone to complete the transaction.";
            console.log("Response:", response.data); // Log the response for debugging
            
            const transactionId = response.data.transactionId; // Get transactionId

            // Start checking for payment status every 5 seconds
            const interval = setInterval(() => {
                checkPaymentStatus(transactionId, interval); // Pass the interval to clear it later
            }, 5000);
        })
        .catch(function(error) {
            paymentStatus.textContent = "Error sending STK Push: " + error.message;
            console.log("Error:", error);
        });
    }
    
    function checkPaymentStatus(transactionId, interval) {
        axios.get(`https://stk-push-murex.vercel.app/mpesa/payment-status?transactionId=${transactionId}`)
            .then(function(response) {
                const status = response.data.status || "Unknown status"; // Adjust based on your actual response structure
                paymentStatus.textContent = `Payment status: ${status}`;

                if (status === "Success" || status === "Failed") {
                    clearInterval(interval); // Stop checking on success or failure
                }
            })
            .catch(function(error) {
                console.error("Error fetching payment status:", error);
                paymentStatus.textContent = "Error fetching payment status.";
                clearInterval(interval); // Stop checking on error
            });
    }
});
