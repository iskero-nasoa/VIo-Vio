import { Router } from "express";
import {
  createSupergroup, getSupergroups, getSupergroup,
  updateSupergroup, deleteSupergroup,
  addSupergroupMember, removeSupergroupMember, leaveSupergroupHandler,
  getTopics, createTopic, updateTopic, deleteTopic, getTopicMessages,
} from "../controllers/supergroupController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", getSupergroups);
router.post("/", createSupergroup);
router.get("/:id", getSupergroup);
router.patch("/:id", updateSupergroup);
router.delete("/:id", deleteSupergroup);
router.post("/:id/members", addSupergroupMember);
router.delete("/:id/members/:memberId", removeSupergroupMember);
router.post("/:id/leave", leaveSupergroupHandler);

router.get("/:id/topics", getTopics);
router.post("/:id/topics", createTopic);
router.patch("/:id/topics/:topicId", updateTopic);
router.delete("/:id/topics/:topicId", deleteTopic);
router.get("/:id/topics/:topicId/messages", getTopicMessages);

export default router;
