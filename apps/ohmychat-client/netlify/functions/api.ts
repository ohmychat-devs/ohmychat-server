import { app } from "@ohmychat/ohmychat-backend-core";
import ServerlessHttp from "serverless-http";

export const handler = ServerlessHttp(app);