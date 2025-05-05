import { useState, useRef, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../../context/authProvider";
import Papa from "papaparse";
import { useToast } from "../../context/ToastContext";

const AddMultipleTransactionsModal = ({ isOpen, onClose, onBulkAdded }) => {
  const { showToast } = useToast();

  const { auth } = useContext(AuthContext);
  const modalRef = useRef(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!csvFile) return;

    setUploading(true);
    setErrorMessage("");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log("CSV parsing complete. Raw results:", results);

        try {
          const parsedData = results.data;

          const transactions = parsedData
            .map((tx, idx) => {
              if (
                !tx.name ||
                !tx.category ||
                !tx.type ||
                !tx.date ||
                isNaN(parseFloat(tx.totalAmount))
              ) {
                console.warn(
                  `Skipping invalid transaction at row ${idx + 2}:`,
                  tx
                );
                return null;
              }

              return {
                ...tx,
                userId: auth._id,
                totalAmount: parseFloat(tx.totalAmount),
              };
            })
            .filter(Boolean);

          console.log("✅ Final parsed transactions:");
          console.table(transactions);

          if (!transactions.length) {
            setErrorMessage("No valid transactions found in CSV file.");
            setUploading(false);
            return;
          }

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/transactions/multiple`,
            { transactions },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          showToast("Transactions uploaded successfully!", "success");
          onBulkAdded(response.data.data);
          setCsvFile(null);
          onClose();
        } catch (err) {
          console.error("❌ Bulk upload failed:", err);
          showToast(
            err.response?.data?.message || "Failed to upload transactions.",
            "error"
          );
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        console.error("❌ CSV parsing error:", err);
        setUploading(false);
        showToast("Error parsing CSV file: " + err.message, "error");
      },
    });
  };

  // Handle modal visibility
  if (isOpen && modalRef.current && !modalRef.current.open) {
    modalRef.current.showModal();
  } else if (!isOpen && modalRef.current?.open) {
    modalRef.current.close();
  }

  return (
    <dialog
      ref={modalRef}
      className="fixed w-lg md:w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-sm p-5 items-center justify-center text-center rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">
          Upload Multiple Transactions
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Please upload a CSV file with columns: <br />
          <code>name, description, totalAmount, category, type, date</code>
        </p>

        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 block w-full"
        />

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button
            className="btn-primary rounded-full"
            onClick={handleUpload}
            disabled={!csvFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button className="btn-secondary rounded-full" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

AddMultipleTransactionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBulkAdded: PropTypes.func.isRequired,
};

export default AddMultipleTransactionsModal;
