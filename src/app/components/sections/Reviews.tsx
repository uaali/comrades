"use client";

import React, { useState } from "react";
import { FaStar, FaFlag, FaCheckCircle, FaTrash } from "react-icons/fa";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { useCollection, useDocumentOnce } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import toast from "react-hot-toast";
import ReportModal from "../modals/ReportModal";

const Reviews = ({
  contentId,
}: {
  contentId: string;
}) => {
  const [user] = useAuthState(auth);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(
    null
  );


  // Purchase query
  const purchaseQuery = user?.uid
    ? doc(db, `uploads/${contentId}/purchases/${user.uid}`)
    : null;
  const [purchase] = useDocumentOnce(purchaseQuery);

  // Reviews query
  const reviewsQuery = query(
    collection(db, "reviews"),
    where("contentId", "==", contentId)
  );
  const [reviews, loadingReviews, errorLoadingReviews] =
    useCollection(reviewsQuery);

  // Submit review
  const submitReview = async () => {
    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (!newReview.trim()) {
      toast.error("Review cannot be empty");
      return;
    }
    if(rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      // Add new review
      toast.loading("Submitting review...");
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        contentId,
        reviewer: user.displayName || "Anonymous",
        review: newReview,
        rating,
        createdAt: serverTimestamp(),
      });

      setNewReview("");
      setRating(0);
      toast.dismiss();
      toast.success("Successfully submitted review");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to submit review");
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    if (!user) return;
    toast.loading("Deleting review ...");
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      toast.dismiss();
      toast.success("Successfully deleted review");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to delete review");
    }
  };

  // Report review
  const reportReview = async (reviewId: string) => {
    if (!user) {
      toast.error("Please login to report review");
      return;
    }
    setReportingReviewId(reviewId);
    setShowReportModal(true);
  };

  // Star Rating Component
  const StarRating = ({
    rating,
    setRating,
  }: {
    rating: number;
    setRating?: (rating: number) => void;
  }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`
            ${star <= rating ? "text-yellow-500" : "text-gray-300"}
            ${setRating ? "cursor-pointer hover:text-yellow-600" : ""}
            mr-1
          `}
          onClick={() => setRating && setRating(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="my-4">
      <h2 className="font-bold text-lg md:text-xl tracking-wide font-poppins mb-4">
        Reviews
      </h2>

      {user && purchase?.exists() && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-500 mr-2" />
            <p className="text-sm text-green-700">Verified Purchase</p>
          </div>
          <StarRating rating={rating} setRating={setRating} />
          <textarea
            className="w-full p-2 border rounded mt-2"
            placeholder="Write your review here..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            rows={4}
            maxLength={400}
          />
          <div className="flex justify-between items-center">
            <button
              onClick={submitReview}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit Review
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      <div className="space-y-4">
        {errorLoadingReviews && (
          <p className="text-sm text-red-500">Error loading reviews</p>
        )}
        {loadingReviews && <p>Loading reviews...</p>}
        {reviews && reviews.docs.length > 0 ? (
          reviews.docs.map((review) => (
            <div
              key={review.id}
              className="bg-white border rounded-lg p-4 shadow-sm relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.data().reviewer}</p>
                  <StarRating rating={review.data().rating} />
                </div>
                <div className="flex space-x-2">
                  {user?.uid === review.data().userId && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Review"
                    >
                      <FaTrash />
                    </button>
                  )}
                  {review.data().userId !== user?.uid && (
                    <button
                      onClick={() => reportReview(review.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Report Review"
                    >
                      <FaFlag />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-gray-700">{review.data().review}</p>
              <p className="text-xs text-gray-500 mt-2">
                {review.data().createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center italic">No reviews yet</p>
        )}
      </div>
      {user && reportingReviewId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          userId={user.uid}
          id={reportingReviewId}
          type="review"
        />
      )}
    </div>
  );
};

export default Reviews;
