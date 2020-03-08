import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs";
import * as helmet from "helmet";
import * as i18n from "i18n";
import * as path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { config } from "./config/config";
import { Ticket } from "./entity/Ticket";
import { User } from "./entity/User";
import { createAdminUser1574018391679 } from "./migration/1574018391679-createAdminUser";
import routes from "./routes";
import { toInt } from "./utils/utils";
import { createConfig1041039482032 } from "./migration/1041039482032-createConfig";
import { Config } from "./entity/Config";
import * as fileUpload from "express-fileupload";
import * as proxy from "http-proxy-middleware";

i18n.configure({
  // tslint:disable-next-line: no-bitwise
  defaultLocale: config.defaultLanguage ? config.defaultLanguage : "en",
  directory: path.join(__dirname, "../assets/i18n"),
  objectNotation: true,
});

// Connects to the Database -> then starts the express
createConnection({
  charset: "utf8mb4",
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
  database: config.database_name,
  entities: [
    User,
    Ticket,
    Config,
  ],
  host: config.database_host,
  logging: false,
  migrations: [createAdminUser1574018391679, createConfig1041039482032],
  migrationsRun: true,
  password: config.database_password,
  port: toInt(config.database_port),
  synchronize: true,
  type: "mysql",
  username: config.database_user,
})
  .then(async (connection) => {

    if (!fs.existsSync(config.files_storage_path)) { fs.mkdirSync(config.files_storage_path); }

    await connection.query("SET NAMES utf8mb4;");
    await connection.synchronize();
    // tslint:disable-next-line: no-console
    console.log("Migrations: ", await connection.runMigrations());
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(fileUpload({
      limits: { fileSize: 30 * 1024 * 1024 },
    }));

    // Set all routes from routes folder
    app.use("/api", routes);

    // Set routes for static built frontend

    // for dev:
    // app.use("/*", proxy.createProxyMiddleware({target: 'http://localhost:4200'}));
    // for production:
    app.use("/", express.static(path.join(__dirname, "../../frontend_build")));

    app.listen(config.port, () => {
      // tslint:disable-next-line: no-console
      console.log(`Server started on port ${config.port}!`);
    });
  })
  // tslint:disable-next-line: no-console
  .catch((error) => console.log(error));
