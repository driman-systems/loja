import { FiCreditCard } from "react-icons/fi";
import { FaPix } from "react-icons/fa6";

interface PaymentMethodSelectorProps {
  selectedPaymentMethod: "credit_card" | "pix";
  setSelectedPaymentMethod: (method: "credit_card" | "pix") => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer ${
          selectedPaymentMethod === "credit_card"
            ? "border-red-500"
            : "border-gray-600"
        }`}
        onClick={() => setSelectedPaymentMethod("credit_card")}
      >
        <FiCreditCard className="text-2xl mb-2 mx-auto" />
        <h3 className="text-md text-center">Cartão de Crédito/Débito</h3>
      </div>

      <div
        className={`p-4 rounded-lg border-2 cursor-pointer ${
          selectedPaymentMethod === "pix" ? "border-red-500" : "border-gray-600"
        }`}
        onClick={() => setSelectedPaymentMethod("pix")}
      >
        <FaPix className="text-2xl mb-2 mx-auto" />
        <h3 className="text-md text-center">Pix</h3>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
