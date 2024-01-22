import express from "express";

import {
  getPullRequests,
  createPullRequest,
  updatePullRequest,
  deletePullRequest,
  getPullRequest,
  // addApproval,
  getApprovals,
  updateApproval,
  // addReview,
  getReviews,
  createReview,
} from "../controllers/pullRequest.js";

const router = express.Router();
import auth from "../middleware/auth.js";

router.get("/", getPullRequests);
router.get("/:id", getPullRequest);
router.post("/", auth, createPullRequest);
router.put("/:id", auth, updatePullRequest);
router.delete("/:id", auth, deletePullRequest);

router.post("/:id/comments", auth, createReview);
router.get("/:id/comments", auth, getReviews);

// router.post("/:id/approvals", auth, addApproval);
router.get("/:id/approvals", auth, getApprovals);
// router.get("/:id/approval/:id", auth, getApproval);
router.put("/:pr_id/approval/:ap_id", auth, updateApproval);

export default router;
