import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";

// Initialize Stripe outside component to avoid re-mounting
const stripePromise = loadStripe("pk_test_51T39EgDRydSsxFQ79Yvw10kvW773dmSbiiElC6dZEzIbaMciU1wycJqsE9WJSFNIXWNmXbG40QPhTm1zVQmQPkjY00GxAlABvC");

const CheckoutForm = ({ studentId, amount, onPageRefresh }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // 1. Get Client Secret from backend
      const { data } = await axios.post(`${API_BASE_URL}/payment/create-payment-intent`, {
        amount,
        studentId,
      });

      // 2. Confirm payment on client side
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          // 3. Verify on backend to update DB
          await axios.post(`${API_BASE_URL}/payment/verify-payment`, {
            paymentIntentId: result.paymentIntent.id,
            studentId,
          });
          alert("Payment Successful!");
          onPageRefresh();
        }
      }
    } catch (err) {
      setMessage("Payment Failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-700/50">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      <button
        disabled={!stripe || loading}
        className="w-full py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
      {message && <p className="text-red-500 text-center text-sm mt-2">{message}</p>}
    </form>
  );
};

const FeePayment = (props) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl">
      <h3 className="text-xl font-bold dark:text-white mb-1 text-center">Stripe Secure Payment</h3>
      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl my-6 text-center">
        <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-widest">Total Amount Due</p>
        <p className="text-4xl font-black text-red-700">₹{props.amount}</p>
      </div>
      
      {/* Wrap the checkout form with Elements */}
      <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
      </Elements>
    </div>
  );
};

export default FeePayment;