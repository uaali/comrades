import React from "react";

interface StorageUsageProps {
  currentStorage: number;
  totalStorage: number;
}

const StorageUsage: React.FC<StorageUsageProps> = ({
  currentStorage,
  totalStorage,
}) => {
  const percentageUsed = (currentStorage / totalStorage) * 100;
  const storageColor = percentageUsed > 80 ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
      <div
        className={`h-full ${storageColor} transition-all duration-500 ease-in-out flex items-center justify-center`}
        style={{ width: `${percentageUsed}%` }}
      >
        {percentageUsed > 0 && (
          <p className="text-white text-sm text-center">
            {`${Math.round(percentageUsed)}%`}
          </p>
        )}
      </div>
    </div>
  );
};

export default StorageUsage;
