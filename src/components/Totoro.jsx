/** Totoro da marca da Daphne (silhueta da capa do portfólio), recolorível via CSS. */
export default function Totoro({ body = 'currentColor', belly = 'transparent', className = '', style }) {
  return (
    <span className={`totoro ${className}`} style={{ ...style, '--body': body, '--belly': belly }} aria-hidden="true">
      <i className="totoro__shape" />
      <i className="totoro__detail" />
    </span>
  )
}
