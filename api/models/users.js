"use strict";
const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profiles" }, // Ссылка на профиль
    status: { type: String, enum: ["active", "inactive"], required: true },
    registerDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UsersSchema);
