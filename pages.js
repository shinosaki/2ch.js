import { Hono } from 'hono'
import api from './hono'

const app = new Hono()

app.route('/api', api)
app.get('*', c => c.env.ASSETS.fetch(c.req.raw))

export default app