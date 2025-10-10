import { Link } from "react-router"

const AppHeader = () => {
  return (
    <header>
      <Link to="/" className="text-2xl font-bold">
        Finance Folio
      </Link>
    </header>
  )
}

export default AppHeader