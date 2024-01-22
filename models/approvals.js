import mongoose from 'mongoose';


const approvalSchema = mongoose.Schema({
    pullRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PullRequest'
    },
    approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

var Approvals = mongoose.model('Approvals', approvalSchema);

export default Approvals;