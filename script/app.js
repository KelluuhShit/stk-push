document.addEventListener("DOMContentLoaded", function() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const purchasePage = document.getElementById("purchasePage");
    const phoneInput = document.getElementById("phoneInput");
    const amountInput = document.getElementById("amountInput");
    const payButton = document.getElementById("payButton");
    const paymentStatus = document.getElementById("paymentStatus");

    checkoutBtn.addEventListener('click', ()=>{
        purchasePage.style.display ="block";
        console.log('clicked');
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
            const paymentId = response.data.paymentId;
            pollPaymentStatus(paymentId);
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    function pollPaymentStatus(paymentId) {
        const intervalId = setInterval(function() {
            axios.get(`http://localhost:5500/payment/status/${paymentId}`)
            .then(function(response) {
                if (response.data.status === "success") {
                    paymentStatus.textContent = "Payment successful!";
                    clearInterval(intervalId);
                } else if (response.data.status === "failed") {
                    paymentStatus.textContent = "Payment failed: " + response.data.error;
                    clearInterval(intervalId);
                }
            })
            .catch(function(error) {
                console.log(error);
                clearInterval(intervalId);
            });
        }, 5000);
    }
});
