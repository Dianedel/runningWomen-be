const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailboxSchema = new Schema ({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true },
    content: {
        type: String,
        required: false,
        minlength: 1,
        maxlength: 2000 },
}, {
    timestamps: true
});

const Mailbox = mongoose.model("Mailbox", mailboxSchema);

module.exports = Mailbox;