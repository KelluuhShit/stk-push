import { useState, } from "react";
import "./index.css";
import Axios from "axios";

function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);

  const payHandler = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:5500/token", {
      amount,
      phone,
    })
      .then((res) => {
        console.log(res);
        // Assuming res.data contains paymentId
        const paymentId = res.data.paymentId;
        // Start polling for payment status
        pollPaymentStatus(paymentId);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const pollPaymentStatus = (paymentId) => {
    const intervalId = setInterval(() => {
      Axios.get(`http://localhost:5500/payment/status/${paymentId}`)
        .then((res) => {
          console.log(res);
          if (res.data.status === "success") {
            setPaymentStatus("Payment successful!");
            clearInterval(intervalId); // Stop polling
          } else if (res.data.status === "failed") {
            setPaymentStatus("Payment failed: " + res.data.error);
            clearInterval(intervalId); // Stop polling
          }
        })
        .catch((error) => {
          console.log(error);
          clearInterval(intervalId); // Stop polling on error
        });
    }, 5000); // Poll every 5 seconds (adjust as needed)
  };

  return (
    <div className="container">
      <h1 className="text-2xl">
        Pay with <span className="mpesa">Mpesa</span>{" "}
      </h1>
      <form className="form">
        <input
          placeholder="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={payHandler}
        >
          Pay Now
        </button>
      </form>
      {paymentStatus && <p className="text-red-600">{paymentStatus}</p>}
    </div>
  );
}

export default App;
