import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — LLM calls can be slow
})

export const extractRecipe = (url) =>
  api.post('/recipes/extract', { url }).then((r) => r.data)

export const listRecipes = (skip = 0, limit = 20) =>
  api.get('/recipes/', { params: { skip, limit } }).then((r) => r.data)

export const getRecipe = (id) =>
  api.get(`/recipes/${id}`).then((r) => r.data)

export const deleteRecipe = (id) =>
  api.delete(`/recipes/${id}`)

export default api
