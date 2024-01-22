import express from "express";
import mongoose from "mongoose";

import PullRequest from "../models/pullRequest.js";
import Reviews from "../models/reviews.js";
import Approvals from "../models/approvals.js";
import User from "../models/user.js"

const router = express.Router();

export const getPullRequests = async (req, res) => {
  try {
    // const pullRequests = await Approvals.find({
    //   approverId: req.userId,
    // }).populate("pullRequestId");
    const pullRequests = await PullRequest.find();
    //   $expr: {
    //     $in: [req.userId, "$approvers"],
    //   },
    // });
    res.status(200).json(pullRequests);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// export const getUsers = async (req, res) => {
//   try {
//     // const pullRequests = await Approvals.find({
//     //   approverId: req.userId,
//     // }).populate("pullRequestId");
//     const pullRequests = await PullRequest.find();
//     //   $expr: {
//     //     $in: [req.userId, "$approvers"],
//     //   },
//     // });
//     res.status(200).json(pullRequests);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

export const getPullRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const pullRequest = await PullRequest.findById(id);

    res.status(200).json(pullRequest);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await Reviews.find({
      pullRequestId: id,
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPullRequest = async (req, res) => {
  const pullRequest = req.body;
  try {
    const approvers = await User.find().where('username').in(pullRequest.approvers);
    const approverIds = [];
    approvers.forEach((el) => approverIds.push(el._id));

    const newPullRequest = new PullRequest({
      ...pullRequest,
      approvers: approverIds,
      requesterId: req.userId,
      createdAt: new Date().toISOString(),
    });
    // const newApproval = new Approval({pullRequestId: newPullRequest.id, approverId: })

    const approvals = [];
    if (newPullRequest.approvalType == 'Parallel') {
      newPullRequest.approvers.forEach((el) =>
        approvals.push(
          Approvals.create({
            approverId: el,
            pullRequestId: newPullRequest.id,
            createdAt: new Date().toISOString(),
          }),
        ),
      );
    } else if (newPullRequest.approvalType == 'Sequential') {
      approvals.push(
        Approvals.create({
          approverId: newPullRequest.approvers[0],
          pullRequestId: newPullRequest.id,
          createdAt: new Date().toISOString(),
        }),
      );
    }

    await Promise.all(approvals);
    await newPullRequest.save();

    res.status(201).json(newPullRequest);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  const review = req.body;
  const { id } = req.params;
  const newReviews = new Reviews({
    ...review,
    pullRequestId: id,
    reviewerId: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newReviews.save();

    res.status(201).json(newReviews);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePullRequest = async (req, res) => {
  const { id } = req.params;
  const { title, description, approvers, updatedAt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No pullRequest with id: ${id}`);

  const updatedPullRequest = {
    title,
    description,
    approvers,
    updatedAt: new Date().toISOString(),
    _id: id,
  };

  await PullRequest.findByIdAndUpdate(id, updatedPullRequest, { new: true });

  res.json(updatedPullRequest);
};

export const deletePullRequest = async (req, res) => {
  const { id } = req.params;

  //TODO delete all approvals also

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No pullRequest with id: ${id}`);

  await PullRequest.findByIdAndRemove(id);

  res.json({ message: "PullRequest deleted successfully." });
};

// export const approvePullRequest = async (req, res) => {
//   const { id } = req.params;
//
//   if (!req.userId) {
//     return res.json({ message: "Unauthenticated" });
//   }
//
//   if (!mongoose.Types.ObjectId.isValid(id))
//     return res.status(404).send(`No pullRequest with id: ${id}`);
//
//   const pullRequest = await PullRequest.findById(id);
//
//   const index = pullRequest.approvers.findIndex(
//     (id) => id === String(req.userId),
//   );
//
//   if (index === -1) {
//     pullRequest.approvers.push(req.userId);
//   } else {
//     pullRequest.approvers = pullRequest.approvers.filter(
//       (id) => id !== String(req.userId),
//     );
//   }
//   const updatedPullRequest = await PullRequest.findByIdAndUpdate(
//     id,
//     pullRequest,
//     { new: true },
//   );
//   res.status(200).json(updatedPullRequest);
// };

export const getApprovals = async (req, res) => {
  const { id } = req.params;

  try {
    const approvals = await Approvals.find().where("pullRequestId").in([id]);

    res.status(200).json(approvals);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// export const getApproval = async (req, res) => {
//   const { pr_id, ap_id } = req.params;
//
//   try {
//     const approval = await Approvals.findById(ap_id);
//
//     res.status(200).json(approvals);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

export const updateApproval = async (req, res) => {
  const { pr_id, ap_id } = req.params;
  const { updateType } = req.body;
  try {
    const pullRequest = await PullRequest.findById(pr_id);
    const approval = await Approvals.findById(ap_id);
    if (approval.approverId != req.userId) {
      throw "Approver ID does not match";
    }
    if (approval.status !== 'Pending') {
      throw "User has already approved or rejected this pull request";
    }
    approval.status = req.body.status;
    if (updateType == 'Reject') {
      pullRequest.status = 'Rejected';
    } else if (updateType == 'Approve') {
      pullRequest.approversCnt = pullRequest.approversCnt + 1;
      if (pullRequest.approversCnt == pullRequest.approvers.length) {
        pullRequest.status = "Approved";
      } else if (pullRequest.approvalType == 'Sequential') {
        const newApproval = Approvals.create({
          approverId: pullRequest.approvers[pullRequest.approversCnt],
          pullRequestId: pullRequest.id,
          createdAt: new Date().toISOString(),
        });
        await newApproval.save();
      }
    }
    await approval.save();
    await pullRequest.save();
    res.status(200).json(approval);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// export const addApproval = async (req, res) => {
//   const { id } = req.params;

//   try {
//     res.status(200);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

// export const rejectPullRequest = async (req, res) => {
//   const { id } = req.params;
//
//   if (!req.userId) {
//     return res.json({ message: "Unauthenticated" });
//   }
//
//   if (!mongoose.Types.ObjectId.isValid(id))
//     return res.status(404).send(`No pullRequest with id: ${id}`);
//
//   const pullRequest = await PullRequest.findById(id);
//
//   const index = pullRequest.approvers.findIndex(
//     (id) => id === String(req.userId),
//   );
//
//   if (index !== -1) {
//     pullRequest.approvers = pullRequest.approvers.filter(
//       (id) => id !== String(req.userId),
//     );
//   }
//   pullRequest.status = "Rejected";
//   const updatedPullRequest = await PullRequest.findByIdAndUpdate(
//     id,
//     pullRequest,
//     { new: true },
//   );
//   res.status(200).json(updatedPullRequest);
// };

export default router;
