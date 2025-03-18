import { Router } from 'express';
import express from 'express';

export async function createRouter(): Promise<Router> {
  const router = express.Router();

  router.get('/my-api', async (req, res) => {
    res.json({
      message: 'Hello from Backstage!',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
