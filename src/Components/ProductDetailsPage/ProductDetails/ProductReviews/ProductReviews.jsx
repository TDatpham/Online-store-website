import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { showAlert } from "src/Features/alertsSlice";
import { productApi } from "src/Services/api";
import s from "./ProductReviews.module.scss";

const MAX_STARS = 5;

const ProductReviews = ({ productData, onReviewChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loginInfo } = useSelector((state) => state.user);
  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (productData?.id) {
      fetchReviews();
    }
  }, [productData?.id]);

  const fetchReviews = async () => {
    try {
      const response = await productApi.getReviews(productData.id);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      dispatch(showAlert({ alertText: "Please select a rating.", alertState: "warning", alertType: "alert" }));
      return;
    }

    setIsLoading(true);
    try {
      const reviewData = {
        rating,
        comment: comment.trim(),
        userName: loginInfo?.username || "Anonymous",
        productId: productData.id,
      };

      if (editingReviewId) {
        await productApi.updateReview(editingReviewId, reviewData);
        dispatch(showAlert({ alertText: "Review updated!", alertState: "success", alertType: "alert" }));
      } else {
        await productApi.addReview(productData.id, reviewData);
        dispatch(showAlert({ alertText: "Thank you for your review!", alertState: "success", alertType: "alert" }));
      }

      setRating(0);
      setComment("");
      setEditingReviewId(null);
      fetchReviews();
      if (onReviewChange) onReviewChange();
    } catch (error) {
      console.error("Failed to submit review", error);
      dispatch(showAlert({ alertText: "Failed to submit review", alertState: "error", alertType: "alert" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    window.scrollTo({ top: document.getElementById('details-section').offsetTop + 400, behavior: 'smooth' });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await productApi.deleteReview(reviewId);
      dispatch(showAlert({ alertText: "Review deleted", alertState: "success", alertType: "alert" }));
      fetchReviews();
      if (onReviewChange) onReviewChange();
    } catch (error) {
      console.error("Failed to delete review", error);
      dispatch(showAlert({ alertText: "Failed to delete review", alertState: "error", alertType: "alert" }));
    }
  };

  return (
    <section className={s.reviewsSection} aria-label="Product reviews">
      <h3 className={s.title}>{t("detailsPage.reviewsTitle")}</h3>
      <div className={s.summary}>
        <div className={s.avgScore}>
          <span className={s.bigRate}>{productData?.rate?.toFixed(1) || "0.0"}</span>
          <div className={s.starsSummary}>
            {Array.from({ length: MAX_STARS }, (_, i) => (
              <span key={i} className={s.summaryStar} data-active={i < Math.round(productData?.rate || 0)}>★</span>
            ))}
          </div>
          <span className={s.totalVotes}>{t("detailsPage.reviews", { votes: productData?.votes || 0 })}</span>
        </div>
      </div>

      <div className={s.starRow}>
        <span className={s.starLabel}>{editingReviewId ? "Update your rating:" : t("detailsPage.selectStars")}</span>
        <div className={s.stars}>
          {Array.from({ length: MAX_STARS }, (_, i) => {
            const value = i + 1;
            const active = value <= (hoverStar || rating);
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverStar(value)}
                onMouseLeave={() => setHoverStar(0)}
                aria-label={`${value} star`}
                className={s.starBtn}
                data-active={active}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={s.form}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("detailsPage.writeComment")}
          rows={3}
          className={s.textarea}
        />
        <div className={s.formBtns}>
          <button type="submit" className={s.submitBtn} disabled={isLoading}>
            {isLoading ? "Processing..." : (editingReviewId ? "Update Review" : t("detailsPage.submitReview"))}
          </button>
          {editingReviewId && (
            <button type="button" className={s.cancelBtn} onClick={() => { setEditingReviewId(null); setRating(0); setComment(""); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={s.commentsList}>
        <h4 className={s.commentsTitle}>{t("detailsPage.commentsTitle")}</h4>
        {reviews.length === 0 ? (
          <p className={s.noComments}>{t("detailsPage.noCommentsYet")}</p>
        ) : (
          <ul className={s.comments}>
            {reviews.map((r) => (
              <li key={r.id} className={s.commentItem}>
                <div className={s.commentHeader}>
                  <div className={s.userInfo}>
                    <span className={s.username}>{r.userName || "Anonymous"}</span>
                    <div className={s.commentStars}>
                      {Array.from({ length: MAX_STARS }, (_, j) => (
                        <span key={j} className={s.commentStar} data-filled={j < r.rating}>★</span>
                      ))}
                    </div>
                  </div>
                  {loginInfo?.username === r.userName && (
                    <div className={s.actions}>
                      <button onClick={() => handleEdit(r)} className={s.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(r.id)} className={s.deleteBtn}>Delete</button>
                    </div>
                  )}
                </div>
                {r.comment && <p className={s.commentText}>{r.comment}</p>}
                <time className={s.commentDate}>
                  {r.date ? new Date(r.date).toLocaleDateString() : ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
