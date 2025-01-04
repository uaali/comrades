"use client";

import React from "react";
import { Button, Spinner } from "flowbite-react";
import { useTransactions, useWithdrawals } from "@/hooks/useTransactions";
import { Transaction, Withdrawal } from "@/types";
import { MdMoney, MdCreditCard } from "react-icons/md";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";

const TransactionTable = ({
  transactions,
  type,
  title,
  icon: Icon,
}: {
  transactions: Transaction[];
  type: "sales" | "purchases";
  title: string;
  icon: React.ComponentType<{ size: number; className: string }>;
}) => (
  <div className="bg-background-300 rounded-xl shadow-lg overflow-hidden mb-8">
    <div className="p-4 border-b border-secondary-100">
      <div className="flex items-center">
        <Icon size={24} className="text-primary-200 mr-2" />
        <h2 className="text-xl font-poppinsB text-text-50">{title}</h2>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-text-400 bg-background-50">
          <tr>
            <th className="px-4 py-3 font-poppins">Date</th>
            <th className="px-4 py-3 font-poppins">Content</th>
            <th className="px-4 py-3 font-poppins">Amount</th>
            {type === "sales" && (
              <>
                <th className="px-4 py-3 font-poppins">Charges</th>
                <th className="px-4 py-3 font-poppins">Net Amount</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100">
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="bg-background-100 hover:bg-background-50 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {("toDate" in transaction.createdAt
                  ? transaction.createdAt.toDate()
                  : transaction.createdAt
                ).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/content/${transaction.contentId}`}
                  className="text-primary-200 hover:text-primary-300 hover:underline"
                >
                  View
                </Link>
              </td>
              <td className="px-4 py-3 font-poppinsB text-primary-200">
                {transaction.amount} {transaction.currency}
              </td>
              {type === "sales" && (
                <>
                  <td className="px-4 py-3 text-text-400">
                    {transaction.charges}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {transaction.netAmount}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const WithdrawalsTable = ({
  withdrawals,
  loading,
  error,
  hasMore,
  loadMore,
}: {
  withdrawals: Withdrawal[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
}) => (
  <div className="bg-background-300 rounded-xl shadow-lg overflow-hidden">
    <div className="p-4 border-b border-secondary-100">
      <h2 className="text-xl font-poppinsB text-text-50">Withdrawals History</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-text-400 bg-background-50">
          <tr>
            <th className="px-4 py-3 font-poppins">Date</th>
            <th className="px-4 py-3 font-poppins">Amount</th>
            <th className="px-4 py-3 font-poppins">Phone</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100">
          {withdrawals.map((withdrawal) => (
            <tr
              key={withdrawal.userId}
              className="bg-background-100 hover:bg-background-50 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {("toDate" in withdrawal.createdAt
                  ? withdrawal.createdAt.toDate()
                  : withdrawal.createdAt
                ).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-poppinsB text-primary-200">
                {withdrawal.amount}
              </td>
              <td className="px-4 py-3">{withdrawal.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {hasMore && (
      <div className="text-center p-4">
        <Button
          color="gray"
          size="sm"
          disabled={loading}
          onClick={loadMore}
          className="text-text-50 bg-background-50 hover:bg-background-100"
        >
          {loading ? <Spinner size="sm" /> : "Load More"}
        </Button>
      </div>
    )}
  </div>
);

const LoadingState = () => (
  <div className="flex justify-center items-center py-8">
    <Spinner size="lg" />
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <p className="text-red-500 font-inter">{message}</p>
    <Button
      color="gray"
      size="sm"
      className="mt-4"
      onClick={() => window.location.reload()}
    >
      Try Again
    </Button>
  </div>
);

const Transactions: React.FC = () => {
  const [user] = useAuthState(auth);
  const pageSize = 10;

  const {
    data: salesData,
    loading: salesLoading,
    error: salesError,
    hasMore: hasMoreSales,
    loadMore: loadMoreSales,
  } = useTransactions(pageSize, user?.uid, "sales");

  const {
    data: purchasesData,
    loading: purchasesLoading,
    error: purchasesError,
    hasMore: hasMorePurchases,
    loadMore: loadMorePurchases,
  } = useTransactions(pageSize, user?.uid, "purchases");

  const {
    data: withdrawalsData,
    loading: withdrawalsLoading,
    error: withdrawalsError,
    hasMore: hasMoreWithdrawals,
    loadMore: loadMoreWithdrawals,
  } = useWithdrawals(pageSize, user?.uid);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-poppinsB text-text-50 mb-2">
          Transactions Dashboard
        </h1>
        <p className="text-text-400 font-inter">
          View your sales, purchases, and withdrawals
        </p>
      </div>

      {/* Sales Section */}
      {salesLoading && !salesData.length ? (
        <LoadingState />
      ) : salesError ? (
        <ErrorState message={salesError.message} />
      ) : (
        <TransactionTable
          transactions={salesData}
          type="sales"
          title="Sales History"
          icon={MdMoney}
        />
      )}

      {/* Purchases Section */}
      {purchasesLoading && !purchasesData.length ? (
        <LoadingState />
      ) : purchasesError ? (
        <ErrorState message={purchasesError.message} />
      ) : (
        <TransactionTable
          transactions={purchasesData}
          type="purchases"
          title="Purchase History"
          icon={MdCreditCard}
        />
      )}

      {/* Withdrawals Section */}
      {withdrawalsLoading && !withdrawalsData.length ? (
        <LoadingState />
      ) : withdrawalsError ? (
        <ErrorState message={withdrawalsError.message} />
      ) : (
        <WithdrawalsTable
          withdrawals={withdrawalsData}
          loading={withdrawalsLoading}
          error={withdrawalsError}
          hasMore={hasMoreWithdrawals}
          loadMore={loadMoreWithdrawals}
        />
      )}
    </div>
  );
};

export default Transactions;