import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const AddBudgetModal = ({ isOpen, onClose, onBudgetAdded, existingBudget }) => {
  const { auth } = useContext(AuthContext);
  const modalRef = useRef(null);

  const [othersBudget, setOthersBudget] = useState(null);
  const [name, setName] = useState(existingBudget?.name || "");
  const [amount, setAmount] = useState(existingBudget?.amount || "");
  const [startDate, setStartDate] = useState(
    existingBudget ?
      new Date(existingBudget.startDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    existingBudget ?
      new Date(existingBudget.endDate).toISOString().split("T")[0]
    : ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchOthersBudget = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/budgets/getByName/Others`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setOthersBudget(response.data.data);
        }
      } catch (err) {
        console.error(
          "Error fetching budget:",
          err.response?.data || err.message
        );
        setErrorMessage(
          err.response?.data?.message || "Failed to fetch budget"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOthersBudget();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (existingBudget) {
        if (amount < existingBudget.spent) {
          setErrorMessage("Cannot set budget amount less than spent");
          return;
        }
        console.log(
          othersBudget.amount +
            othersBudget.earned -
            othersBudget.spent +
            (existingBudget.amount +
              existingBudget.earned -
              existingBudget.spent)
        );
        if (
          amount >
          othersBudget.amount +
            othersBudget.earned -
            othersBudget.spent +
            (existingBudget.amount +
              existingBudget.earned -
              existingBudget.spent)
        ) {
          setErrorMessage("Not enough balance!");
          return;
        }
        const updatedBudget = await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/budgets/${existingBudget._id}`,
          { userId: auth._id, name, amount, startDate, endDate },
          { withCredentials: true }
        );

        if (updatedBudget.data.success) {
          const changedAmount = existingBudget.amount - amount;
          const updateOthersResponse = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/budgets/updateAmount/${othersBudget._id}`,
            { amount: changedAmount },
            { withCredentials: true }
          );
          if (updateOthersResponse.data.success) {
            alert("Budget updated successfully!");
            console.log("SENDING UPDATED BUDGET: ", updatedBudget);
            onBudgetAdded(updatedBudget.data.data);
          } else {
            alert("Failed to update 'Others' budget.");
          }
        } else {
          alert("Failed to update budget.");
        }
      } else {
        if (
          amount >
          othersBudget.amount + othersBudget.earned - othersBudget.spent
        ) {
          setErrorMessage("Not enough balance!");
          return;
        }
        const newBudget = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/budgets`,
          {
            userId: auth._id,
            name,
            amount,
            spent: 0,
            earned: 0,
            startDate,
            endDate,
            closed: false,
          },
          { withCredentials: true }
        );
        if (newBudget.data.success) {
          alert("Budget added successfully!");
          onBudgetAdded(newBudget.data.data);
        } else {
          alert("Failed to create Budget");
        }
      }

      setErrorMessage("");
      onClose();
    } catch (err) {
      console.error("Error saving budget:", err.response?.data.message);
      setErrorMessage(err.response.data.message);
      // alert("Failed to save budget.");
    }
  };

  return (
    <dialog
      ref={modalRef}
      className="fixed w-md md:w-l lg:w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black bg-opacity-50"
    >
      {isLoading ?
        <p> Loading...</p>
      : <div className="bg-white w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-sm p-5 items-center justify-center rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-semibold text-center mb-4">
            {existingBudget ? "Edit" : "Add"} Budget
          </h2>

          {!existingBudget && (
            <h4 className="text-sm text-center text-gray-500 mb-2">
              You can allocate at most{" "}
              {othersBudget.amount + othersBudget.earned - othersBudget.spent}{" "}
              for this budget
            </h4>
          )}

          {isLoading ?
            <p className="text-center">Loading...</p>
          : <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              {errorMessage && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
              )}

              <input
                className="input-field"
                type="text"
                placeholder="Budget Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="input-field"
                type="number"
                min="1"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={existingBudget?.closed}
                required
              />

              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <input
                  className="input-field"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={existingBudget?.closed}
                />
                <input
                  className="input-field"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={existingBudget?.closed}
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <button type="submit" className="btn-primary rounded-full">
                  Save Budget
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary rounded-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          }
        </div>
      }
    </dialog>
  );
};

AddBudgetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBudgetAdded: PropTypes.func.isRequired,
  existingBudget: PropTypes.object,
};

export default AddBudgetModal;
