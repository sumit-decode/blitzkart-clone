import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReviews } from "@/contexts/ReviewContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewSectionProps {
  productName: string;
}

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = "h-4 w-4",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} transition-colors ${
            interactive ? "cursor-pointer" : ""
          } ${
            star <= (hover || rating)
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
};

const ReviewSection = ({ productName }: ReviewSectionProps) => {
  const { getProductReviews, getAverageRating, addReview } = useReviews();
  const { user, isLoggedIn } = useAuth();
  const reviews = getProductReviews(productName);
  const avgRating = getAverageRating(productName);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!title.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addReview({
      productName,
      userName: user?.name || "Anonymous",
      rating,
      title: title.trim().slice(0, 100),
      comment: comment.trim().slice(0, 500),
    });

    setRating(0);
    setTitle("");
    setComment("");
    setShowForm(false);
    toast.success("Review submitted! Thank you 🎉");
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Customer Reviews ({reviews.length})
        </h2>
        <Button
          onClick={() => {
            if (!isLoggedIn) {
              toast.error("Please login to write a review");
              return;
            }
            setShowForm(!showForm);
          }}
          size="sm"
        >
          Write a Review
        </Button>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex gap-8 items-start bg-secondary/50 rounded-xl p-5">
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={Math.round(avgRating)} size="h-5 w-5" />
            <p className="text-xs text-muted-foreground mt-1 font-body">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-muted-foreground font-body">{star}</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: reviews.length
                        ? `${(count / reviews.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground font-body text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-border rounded-xl p-5 space-y-4 bg-card overflow-hidden"
          >
            <div>
              <label className="text-sm font-medium text-foreground font-body mb-2 block">
                Your Rating
              </label>
              <StarRating rating={rating} onRate={setRating} interactive size="h-7 w-7" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground font-body mb-1 block">
                Review Title
              </label>
              <Input
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground font-body mb-1 block">
                Your Review
              </label>
              <Textarea
                placeholder="Tell others what you think about this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Submit Review</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground font-body text-center py-8">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-4 space-y-2 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary font-heading">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground font-body">
                      {review.userName}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <h4 className="font-heading font-semibold text-sm text-foreground">
                {review.title}
              </h4>
              <p className="text-sm text-muted-foreground font-body">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
