"use strict";

const mongoose = require("mongoose");
const moment = require("moment");
const logger = require("../../logger");

const Accounting = mongoose.model("Accounting");
const Users = mongoose.model("Users");
const Profiles = mongoose.model("Profiles");

exports.check = async (req, res) => {
  try {
    const { login } = req.query; // Получаем параметры из запроса
    if (!login) {
      return res.status(400).json({ "Reply-Message": "Login invalid" });
    }
    const user = await Users.findOne({ username: login }).select("-password");
    if (!user) {
      return res.status(404).json({ "Reply-Message": "Login invalid" });
    }
    res.sendStatus(204);
  } catch (error) {
    logger.error("Check error:", error);
    res.sendStatus(500);
  }
};

exports.auth = async (req, res) => {
  try {
    const { login, password } = req.query;

    if (!login || !password) {
      return res.status(400).json({ "Reply-Message": "Login invalid" });
    }

    // Загружаем профиль вместе с пользователем
    const user = await Users.findOne({ username: login }).populate("profile");

    if (!user) {
      return res.status(404).json({ "Reply-Message": "Authentication failed" });
    }

    if (!user.status.includes("active")) {
      return res.status(401).json({ "Reply-Message": "Login disabled" });
    }

    if (user.password !== password) {
      return res.status(401).json({ "Reply-Message": "Wrong Password" });
    }

    logger.info("User:", user);

    // Проверяем, что профиль загружен
    if (!user.profile) {
      return res.status(400).json({ "Reply-Message": "Invalid profile" });
    }

    // Преобразуем в объект
    const userObj = user.toObject();
    const profileObj = userObj.profile; // Нет необходимости в .toObject(), так как Mongoose уже развернул объект

    // Проверяем срок действия учётной записи
    const expirationDate = moment(user.registerDate).add(
      profileObj.accessPeriod, // Исправлено на корректное свойство
      "days"
    );

    if (profileObj.accessPeriod && moment().isAfter(expirationDate)) {
      return res.status(401).json({ "Reply-Message": "Access time expired" });
    }

    // Приводим Map к обычному объекту с преобразованием значений в строки
    const attributesObj =
      profileObj.attributes instanceof Map
        ? Object.fromEntries(
            [...profileObj.attributes.entries()].map(([key, value]) => [
              key,
              String(value),
            ])
          )
        : Object.fromEntries(
            Object.entries(profileObj.attributes).map(([key, value]) => [
              key,
              String(value),
            ])
          );

    res.status(200).json({
      "WISPr-Bandwidth-Max-Down": profileObj.maxDownload,
      "WISPr-Bandwidth-Max-Up": profileObj.maxUpload,
      ...attributesObj, // Чистый JSON без служебных полей
    });
  } catch (error) {
    logger.error("Auth error:", error);
    res.sendStatus(500);
  }
};

exports.accounting = async (req, res) => {
  try {
    const newEntry = new Accounting(req.body);
    const result = await newEntry.save();
    res.json(result);
  } catch (error) {
    logger.error("Accounting error:", error);
    res.sendStatus(500);
  }
};

exports.create_user = async (req, res) => {
  try {
    const { username, password, profile } = req.body;
    if (!username || !password || !profile) {
      return res
        .status(400)
        .json({ message: "Username, password and profile are required" });
    }

    const profileDoc = await Profiles.findOne({ profileName: profile }); // Например, если профиль по имени
    if (!profileDoc) {
      return res.status(400).json({ "Reply-Message": "Profile not found" });
    }
    // Создаем пользователя с корректным ObjectId профиля
    const newUser = new Users({
      username,
      password,
      profile: profileDoc._id, // Подставляем ObjectId профиля
      status: "active",
    });

    const user = await newUser.save();
    res.json(user);
  } catch (error) {
    logger.error("Create user error:", error);
    res.sendStatus(500);
  }
};

exports.list_all_users = async (req, res) => {
  try {
    const users = await Users.find().populate("profile", "profileName -_id");
    res.json(users);
  } catch (error) {
    logger.error("List users error:", error);
    res.sendStatus(500);
  }
};

exports.update_user = async (req, res) => {
  try {
    const user = await Users.findByIdAndUpdate(req.params.userID, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User successfully updated", user });
  } catch (error) {
    logger.error("Update user error:", error);
    res.sendStatus(500);
  }
};

exports.remove_user = async (req, res) => {
  try {
    const result = await Users.deleteOne({ _id: req.params.userID });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User successfully removed" });
  } catch (error) {
    logger.error("Remove user error:", error);
    res.sendStatus(500);
  }
};

exports.create_profile = async (req, res) => {
  try {
    const newProfile = new Profiles(req.body);
    const profile = await newProfile.save();
    res.json(profile);
  } catch (error) {
    logger.error("Create profile error:", error);
    res.sendStatus(500);
  }
};

exports.list_all_profiles = async (req, res) => {
  try {
    const profiles = await Profiles.find();
    res.json(profiles);
  } catch (error) {
    logger.error("List profiles error:", error);
    res.sendStatus(500);
  }
};

exports.update_profile = async (req, res) => {
  try {
    const profile = await Profiles.findByIdAndUpdate(
      req.params.profileID,
      req.body,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile successfully updated", profile });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.sendStatus(500);
  }
};

exports.remove_profile = async (req, res) => {
  try {
    const result = await Profiles.deleteOne({ _id: req.params.profileID });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile successfully removed" });
  } catch (error) {
    logger.error("Remove profile error:", error);
    res.sendStatus(500);
  }
};
