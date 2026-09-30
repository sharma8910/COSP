import { ActivityEvent } from "../models/ActivityEvent.js";
import { requireAuth } from "../auth.js";
import { Router } from "express";

const router = Router();

router.get('/', requireAuth, async (request, response, next) => {
  try{
    const parentfilter= { parentId: request.user._id };
    if(request.query.childId) parentfilter.childId = request.query.childId;

    const Events = await ActivityEvent.find(parentfilter).sort({ createdAt: -1 }).limit(100);

    return response.json({ events: Events });
  } catch (error) { return next(error); }
});

export default router;