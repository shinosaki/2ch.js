import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import api from './hono'

const app = new Hono()

app.use('*', serveStatic({ root: './' }))
app.route('/api', api)

export default app