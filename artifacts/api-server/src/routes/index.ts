import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import datasetsRouter from "./datasets";
import articlesRouter from "./articles";
import likesRouter from "./likes";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(summaryRouter);
router.use(datasetsRouter);
router.use(articlesRouter);
router.use(likesRouter);

export default router;
