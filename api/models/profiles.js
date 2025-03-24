"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProfileSchema = new Schema(
  {
    profileName: {
      type: String,
      required: [true, "Profile name is required"],
      trim: true,
    },
    maxDownload: {
      type: Number,
      required: [true, "Max Download Speed is required"],
      min: [1, "Download speed must be greater than 0"],
    },
    maxUpload: {
      type: Number,
      required: [true, "Max Upload Speed is required"],
      min: [1, "Upload speed must be greater than 0"],
    },
    accessPeriod: {
      type: Number,
      default: 30, // Значение по умолчанию — 30 дней
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true, // Добавляет createdAt и updatedAt
  }
);

module.exports = mongoose.model("Profiles", ProfileSchema);
