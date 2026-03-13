import { container } from "../../../application/container.js";

const { messageService } = container.services;

export async function history(req, res, next) {
  try {
    const { roomId, cursor, limit } = req.query;
    const result = await messageService.history({ roomId, cursor, limit });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

