import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import api from './hono'

const app = new Hono()

app.use('*', serveStatic({ root: './dist' }))
app.route('/api', api)

export default app