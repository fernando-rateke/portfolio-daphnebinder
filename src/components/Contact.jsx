import Badge from './Badge.jsx'
import { contact } from '../data.js'

export default function Contact() {
  return (
    <section className="contact dark" id="contato">
      <div className="wrap contact__inner">
        <Badge size={170} className="contact__badge spin" color="#f3cef0">
          <span className="badge__d">D</span>
        </Badge>
        <p className="eyebrow" data-reveal>Contato</p>
        <h2 className="contact__title" data-split>
          Vamos criar algo juntos?
        </h2>
        <p className="contact__note" data-reveal>
          Mais trabalhos podem ser apresentados durante uma eventual reunião. Obrigada pela atenção!
        </p>
        <a className="contact__mail" href={`mailto:${contact.email}`} data-reveal data-cursor="escrever">
          {contact.email}
        </a>
        <ul className="contact__links" data-reveal>
          <li>
            <a href={contact.behance} target="_blank" rel="noreferrer">Behance ↗</a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </li>
        </ul>
      </div>
      <footer className="footer wrap">
        <span>© {new Date().getFullYear()} Daphne Binder</span>
        <span>Graphics by Daphne · since 2015</span>
      </footer>
    </section>
  )
}
