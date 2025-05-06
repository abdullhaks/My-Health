import React from "react";

interface Props {
  onClose: () => void;
}

const SubscriptionModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-40 px-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-xl">
        <div className="text-center py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Choose your plan</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-around items-center gap-6 p-6">
          {[
            { title: "Free", price: "Rs 0", term: "/10 dy", btn: "Already using" },
            { title: "POPULAR", price: "Rs1499", term: "/1 yr", btn: "Buy Now" },
            { title: "", price: "Rs149", term: "/1mo", btn: "Buy Now" }
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`bg-black text-white p-6 rounded-xl w-72 text-center shadow-lg ${
                plan.title === "POPULAR" ? "relative" : ""
              }`}
            >
              {plan.title === "POPULAR" && (
                <span className="absolute top-0 left-0 right-0 bg-gray-700 py-1 text-sm font-bold tracking-wider rounded-t-xl">
                  POPULAR
                </span>
              )}
              <h3 className="text-2xl font-semibold mt-2">{plan.title === "POPULAR" ? "" : plan.title}</h3>
              <p className="text-3xl font-bold mt-2">
                {plan.price}
                <span className="text-sm font-normal">{plan.term}</span>
              </p>
              <ul className="text-sm text-left mt-4 space-y-2">
                <li>✔ online consultations with secure video calls</li>
                <li>✔ report analysis service</li>
                <li>✔ advertisement service</li>
              </ul>
              <button
                className={`mt-5 px-4 py-2 rounded-md w-full ${
                  idx === 0
                    ? "bg-gray-700 text-white cursor-default"
                    : "bg-white text-black hover:bg-gray-100 transition cursor-pointer"
                }`}
              >
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center pb-4">
          <button
            onClick={onClose}
            className="mt-2 text-sm text-gray-600 hover:text-black transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
