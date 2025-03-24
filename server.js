const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const config = require("./config");

// Подключение моделей перед использованием
require("./api/models/radius-accounting"); // ✅ Подключаем модель Accounting
require("./api/models/users");
require("./api/models/profiles");

const radiusRoutes = require("./api/routes/radius");

const app = express();
const port = process.env.PORT || 4000;

// Подключение к MongoDB с обработкой ошибок
mongoose
  .connect(config.database, {

  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Завершаем процесс при ошибке подключения
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

// Роуты
radiusRoutes(app);

// Глобальная обработка необработанных ошибок
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(port, () => {
  console.log(`🚀 FreeRADIUS REST API Server started on port: ${port}`);
});
