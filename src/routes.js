import { randomUUID } from 'node:crypto'
import { Database } from "./database/index.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const {title, description} = req.body

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        )
      }

      const isIdValid = database.find('tasks', id)

      if(!isIdValid) {
        return res.writeHead(401).end(
          JSON.stringify({ message: 'task does not exist' })
        )
      }

      database.update('tasks', id, {
        title,
        description
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const isIdValid = database.find('tasks', id)

      if(!isIdValid) {
        return res.writeHead(401).end(
          JSON.stringify({ message: 'task does not exist' })
        )
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.find('tasks', id)

      if(!task) {
        return res.writeHead(401).end(
          JSON.stringify({ message: 'task does not exist' })
        )
      }

      const isTaskComplete = task.completed_at

      database.update('tasks', id, {
        completed_at: isTaskComplete ? null : new Date() 
      })

      console.log(task)



      return res.writeHead(204).end()
    }
  }
]