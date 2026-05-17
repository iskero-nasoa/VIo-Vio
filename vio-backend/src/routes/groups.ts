import { Router } from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  getGroupMessages,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  leaveGroup,
} from "../controllers/groupController";
import {
  createTopic,
  getTopics,
  getTopicMessages,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// Group routes
router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:groupId", getGroup);
router.get("/:groupId/messages", getGroupMessages);
router.patch("/:groupId", updateGroup);
router.delete("/:groupId", deleteGroup);
router.post("/:groupId/members", addMember);
router.delete("/:groupId/members/:memberId", removeMember);
router.post("/:groupId/leave", leaveGroup);

// Topic routes (nested under groups)
router.post("/:groupId/topics", createTopic);
router.get("/:groupId/topics", getTopics);
router.get("/:groupId/topics/:topicId/messages", getTopicMessages);
router.patch("/:groupId/topics/:topicId", updateTopic);
router.delete("/:groupId/topics/:topicId", deleteTopic);

export default router;

