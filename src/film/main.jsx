// Estúdio do vídeo de introdução (apenas em dev: http://localhost:5173/film.html).
// ?capture=1 → modo de captura quadro a quadro usado por scripts/render-intro.mjs
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/500.css'
import '@fontsource/baloo-2/800.css'
import './film.css'
import Film from './Film.jsx'

createRoot(document.getElementById('root')).render(<Film />)
