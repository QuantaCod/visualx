import { Router, type IRouter } from "express";
import {
  clearSessionCookie,
  createSessionToken,
  isAuthenticated,
  setSessionCookie,
  verifyAdminPassword,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const password = String(req.body?.password ?? "");
  if (!password || !verifyAdminPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = createSessionToken();
  setSessionCookie(res, token);
  res.json({ ok: true });
});

router.post("/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/admin/me", (req, res) => {
  res.json({ authenticated: isAuthenticated(req) });
});

export default router;
