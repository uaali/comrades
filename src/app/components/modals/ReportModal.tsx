import React, { useState } from "react";
import { Modal } from "flowbite-react";

// Define types for our reports
type ReportType = "upload" | "review";

interface ReportCase {
  id: string;
  label: string;
}

// Predefined report cases
const uploadReportCases: ReportCase[] = [
  { id: "inappropriate-content", label: "Inappropriate Content" },
  { id: "copyright-violation", label: "Copyright Violation" },
  { id: "wrong-format", label: "Wrong Format/File Type" },
  { id: "corrupt-file", label: "Corrupt or Damaged File" },
  { id: "duplicate-upload", label: "Duplicate Upload" },
];

const reviewReportCases: ReportCase[] = [
  { id: "spam", label: "Spam or Misleading" },
  { id: "harassment", label: "Harassment or Hate Speech" },
  { id: "inappropriate", label: "Inappropriate Content" },
  { id: "off-topic", label: "Off-topic Review" },
  { id: "fake-review", label: "Fake or Fraudulent Review" },
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ReportType;
  id: string;
  userId: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, type }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const reportCases = type === "upload" ? uploadReportCases : reviewReportCases;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomDescription("");
    setShowCustomInput(false);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={handleClose} size="sm">
      <Modal.Header className="border-b border-gray-200 !p-6">
        Report {type === "upload" ? "Upload" : "Review"}
      </Modal.Header>
      <Modal.Body className="!p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select a reason:
            </label>
            <div className="space-y-2">
              {reportCases.map((reportCase) => (
                <div key={reportCase.id} className="flex items-center">
                  <input
                    type="radio"
                    id={reportCase.id}
                    name="reportReason"
                    value={reportCase.id}
                    checked={selectedReason === reportCase.id}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setShowCustomInput(false);
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={reportCase.id}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {reportCase.label}
                  </label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="custom"
                  name="reportReason"
                  value="custom"
                  checked={showCustomInput}
                  onChange={() => {
                    setShowCustomInput(true);
                    setSelectedReason("custom");
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="custom" className="ml-2 text-sm text-gray-700">
                  Other (please specify)
                </label>
              </div>
            </div>
          </div>

          {showCustomInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Please describe the issue:
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required={showCustomInput}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={
                !selectedReason || (showCustomInput && !customDescription)
              }
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ReportModal;
