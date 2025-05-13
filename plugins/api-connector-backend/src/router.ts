import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { TodoListService } from './services/TodoListService/types';
import {transformPodStatusData , transformCICDStatusData } from './dataTransformer'
import path from 'path';


const fs = require('fs');


function createBaseStructure() {
  return {
      level0List: [
          {
              level0Name: "Collection",
              level1List: []
          }
      ]
  };
}

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
    res.json(await todoListService.listTodos());
  });

  router.get('/todos/:id', async (req, res) => {
    res.json(await todoListService.getTodo({ id: req.params.id }));
  });


  router.get('/get-landing-page-data', async (req, res) => {
    const finalJson = createBaseStructure();
    console.log("FINAL JSON", finalJson);

    const kubernetesFilePath = path.join(__dirname, 'kubernetes.json');
    const jenkinsFilePath = path.join(__dirname, 'jenkins.json');

    try {
        const [kubernetesData, jenkinsData] = await Promise.all([
            fs.promises.readFile(kubernetesFilePath, 'utf8'),
            fs.promises.readFile(jenkinsFilePath, 'utf8')
        ]);

        
        const kubernetesJson = JSON.parse(kubernetesData);
        const jenkinsJson = JSON.parse(jenkinsData);

       
        finalJson.level0List[0].level1List.push(transformPodStatusData(kubernetesJson));
        finalJson.level0List[0].level1List.push(transformCICDStatusData(jenkinsJson));
        res.setHeader('Content-Type', 'application/json');
        console.log("FINAL JSON RETURNING")
        console.log(JSON.stringify(finalJson, null, 2));
        res.status(200).json(finalJson);
    } catch (error) {
        console.error("Error processing files:", error);
        res.status(500).json({ error: 'Error reading/parsing JSON files', details: error.message });
    }
});

  return router;
}
