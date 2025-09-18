import app from "./src/server.js";
import type { IncomingMessage, ServerResponse } from "http";

export default (req: IncomingMessage, res: ServerResponse) => {
  app(req, res);
};
