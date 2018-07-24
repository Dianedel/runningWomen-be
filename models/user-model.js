const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    firstName: {
        type: String,
        required: true },
    lastName: {
        type: String,
        required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^.+@.+\..+$/ },
    birthday: {
        type: Date },
    location: {
        type: Object,
        required: true },
    coordinates: [
        { type: Number }
    ],
    speed: {
        type: Number },
    availability: {
        type: String },
    description: {
        type: String,
        maxlength: 500 },
    imageUrl: {
        type: String,
        default: " " },
    role: {
        type: String,
        enum: [ "user", "admin" ],
        default: "user",
        required: true },
    encryptedPassword: {
        type: String ,
        required: true },
    },
    { timestamps: true});

const User = mongoose.model("User", userSchema);

userSchema.virtual("isAdmin").get(function () {
    return this.role === "admin";
});

module.exports = User;