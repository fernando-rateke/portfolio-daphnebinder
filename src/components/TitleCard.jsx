/** Cartão de título rosa, como os divisores do portfólio original. */
export default function TitleCard({ title, years, index, id }) {
  return (
    <div className="titlecard" id={id}>
      <div className="wrap titlecard__inner">
        {index && <span className="titlecard__index" data-reveal>{index}</span>}
        <h2 className="titlecard__title" data-split>
          {title}
        </h2>
        {years && <p className="titlecard__years" data-reveal>{years}</p>}
      </div>
    </div>
  )
}
