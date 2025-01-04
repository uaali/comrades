// hooks/useTransactions.ts
import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Transaction, Withdrawal } from "@/types";

export interface PaginatedResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const useTransactions = (
  pageSize: number = 10,
  userId: string | undefined,
  type: "sales" | "purchases"
): PaginatedResult<Transaction> & { loadMore: () => Promise<void> } => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (
    cursor?: QueryDocumentSnapshot<DocumentData>
  ) => {
    if (!userId) return [];
    try {
      setLoading(true);

      if (type === "purchases") {
        // For purchases, query the transactions collection directly
        const transactionsRef = collection(db, "transactions");
        let q = query(
          transactionsRef,
          where("userId", "==", userId),
          where("status", "==", "complete"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );

        if (cursor) {
          q = query(q, startAfter(cursor));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          id: doc.id,
        })) as Transaction[];

        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(docs.length === pageSize);

        return docs;
      } else {
        if (type === "sales") {
          const transactionsRef = collection(db, "transactions");
          let q = query(
            transactionsRef,
            where("publisherId", "==", userId),
            where("status", "==", "complete"),
            orderBy("createdAt", "desc"),
            limit(pageSize)
          );

          if (cursor) {
            q = query(q, startAfter(cursor));
          }

          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map((doc) => ({
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            id: doc.id,
          })) as Transaction[];

          setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
          setHasMore(docs.length === pageSize);

          return docs;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch transactions")
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const newDocs = await fetchTransactions(lastDoc || undefined);
    setData((prev) => [...prev, ...(newDocs || [])]);
  };

  useEffect(() => {
    const initialFetch = async () => {
      const initialDocs = await fetchTransactions();
      setData(initialDocs || []);
    };
    initialFetch();
  }, [userId, type]);

  return { data, loading, error, lastDoc, hasMore, loadMore };
};

export const useWithdrawals = (
  pageSize: number = 10,
  userId: string | undefined
): PaginatedResult<Withdrawal> & { loadMore: () => Promise<void> } => {
  const [data, setData] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchWithdrawals = async (
    cursor?: QueryDocumentSnapshot<DocumentData>
  ) => {
    if (!userId) return [];
    try {
      setLoading(true);
      const withdrawalsRef = collection(db, "withdrawals");

      let q = query(
        withdrawalsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      if (cursor) {
        q = query(q, startAfter(cursor));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
      })) as Withdrawal[];

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(docs.length === pageSize);

      return docs;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch withdrawals")
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const newDocs = await fetchWithdrawals(lastDoc || undefined);
    setData((prev) => [...prev, ...newDocs]);
  };

  useEffect(() => {
    const initialFetch = async () => {
      const initialDocs = await fetchWithdrawals();
      setData(initialDocs);
    };
    initialFetch();
  }, [userId]);

  return { data, loading, error, lastDoc, hasMore, loadMore };
};
