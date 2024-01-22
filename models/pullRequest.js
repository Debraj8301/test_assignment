import mongoose from 'mongoose';


const pullRequestSchema = mongoose.Schema({
    title: String,
    description: String,
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Approvals'
    },
    status: {
        type: String,
        enum: ['Open', 'Approved', 'Rejected']
    },
    approvalType: {
        type: String,
        enum: ['Sequential', 'Parallel']
    },
    _approversCnt: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
})

var PullRequest = mongoose.model('PullRequest', pullRequestSchema);

export default PullRequest;