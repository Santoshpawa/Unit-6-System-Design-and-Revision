const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'


async function request(path, opts={}){
const token = localStorage.getItem('token')
const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) }
if(token) headers['Authorization'] = `Bearer ${token}`
const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
if(!res.ok) throw new Error((await res.json()).msg || 'Request failed')
return res.json()
}


export default {
get: (p)=>request(p, { method: 'GET' }),
post: (p, body)=>request(p, { method: 'POST', body: JSON.stringify(body) })
}