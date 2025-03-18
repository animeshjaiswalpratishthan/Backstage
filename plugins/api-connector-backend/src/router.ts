import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { TodoListService } from './services/TodoListService/types';
import path from 'path';


const fs = require('fs');

export async function createRouter({
  httpAuth,
  todoListService,
}: {
  httpAuth: HttpAuthService;
  todoListService: TodoListService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // TEMPLATE NOTE:
  // Zod is a powerful library for data validation and recommended in particular
  // for user-defined schemas. In this case we use it for input validation too.
  //
  // If you want to define a schema for your API we recommend using Backstage's
  // OpenAPI tooling: https://backstage.io/docs/next/openapi/01-getting-started
  const todoSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });

  router.post('/todos', async (req, res) => {
    const parsed = todoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const result = await todoListService.createTodo(parsed.data, {
      credentials: await httpAuth.credentials(req, { allow: ['user'] }),
    });

    res.status(201).json(result);
  });

  router.get('/todos', async (_req, res) => {
    console.log("I am in the router.get('/todos') function");
    res.json(await todoListService.listTodos());
  });

  router.get('/todos/:id', async (req, res) => {
    res.json(await todoListService.getTodo({ id: req.params.id }));
  });

  router.get('/get-kubernetes-data', async (req, res) => {
    const filePath = path.join(__dirname, 'kubernetes.json'); // Ensure the path is correct
    console.log("Reading file from:", filePath);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading JSON file', details: err.message });
        }
        try {
            const jsonData = JSON.parse(data);
            res.setHeader('Content-Type', 'application/json'); // Explicitly setting content type
            res.status(200).json(jsonData);
        } catch (parseError) {
            res.status(500).json({ error: 'Error parsing JSON file', details: parseError.message });
        }
    });
});


router.get('/get-jenkins-data', async (req, res) => {
  const filePath = path.join(__dirname, 'jenkins.json'); // Ensure the path is correct
  console.log("Reading file from:", filePath);

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading JSON file', details: err.message });
      }
      try {
          const jsonData = JSON.parse(data);
          res.setHeader('Content-Type', 'application/json'); // Explicitly setting content type
          res.status(200).json(jsonData);
      } catch (parseError) {
          res.status(500).json({ error: 'Error parsing JSON file', details: parseError.message });
      }
  });
});

  return router;
}
