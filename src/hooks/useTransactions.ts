import { useState, useEffect, useMemo } from "react";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Transaction, Withdrawal } from "@/types";

interface PaginatedResult<T> {
  docs: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

const usePaginatedFirestore = <T extends { id: string }>(
  collectionName: string,
  pageSize: number,
  queryConstraints: any[],
  transform: (doc: DocumentData) => T
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (
    cursor?: QueryDocumentSnapshot<DocumentData>
  ): Promise<PaginatedResult<T>> => {
    const collectionRef = collection(db, collectionName);
    let baseQuery = query(
      collectionRef,
      ...queryConstraints,
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const finalQuery = cursor
      ? query(baseQuery, startAfter(cursor))
      : baseQuery;

    const snapshot = await getDocs(finalQuery);
    const docs = snapshot.docs.map((doc) =>
      transform({ ...doc.data(), id: doc.id })
    );

    return {
      docs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: docs.length === pageSize,
    };
  };

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchData(lastDoc);

      setData((prev) => [...prev, ...result.docs]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch ${collectionName}`)
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);

    try {
      setLoading(true);
      setError(null);

      const result = await fetchData();

      setData(result.docs);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Failed to fetch ${collectionName}`)
      );
    } finally {
      setLoading(false);
    }
  };

  // Memoize the stringified constraints to maintain stable dependencies
  const stableQueryConstraints = useMemo(
    () => JSON.stringify(queryConstraints),
    [queryConstraints]
  );

  useEffect(() => {
    let mounted = true;

    const initialFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchData();

        if (mounted) {
          setData(result.docs);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error(`Failed to fetch ${collectionName}`)
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      mounted = false;
    };
  }, [collectionName, pageSize, stableQueryConstraints]);

  return { data, loading, error, hasMore, loadMore, refresh };
};

export const useTransactions = (
  pageSize: number = 10,
  userId: string | undefined,
  type: "sales" | "purchases"
) => {
  const queryConstraints = useMemo(
    () =>
      userId
        ? [
            where(type === "sales" ? "publisherId" : "userId", "==", userId),
            where("status", "==", "complete"),
          ]
        : [],
    [userId, type]
  );

  return usePaginatedFirestore<Transaction>(
    "transactions",
    pageSize,
    queryConstraints,
    (data) =>
      ({
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Transaction)
  );
};

export const useWithdrawals = (
  pageSize: number = 10,
  userId: string | undefined
) => {
  const queryConstraints = useMemo(
    () => (userId ? [where("userId", "==", userId)] : []),
    [userId]
  );

  return usePaginatedFirestore<Withdrawal>(
    "withdrawals",
    pageSize,
    queryConstraints,
    (data) =>
      ({
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Withdrawal)
  );
};

export default usePaginatedFirestore;
