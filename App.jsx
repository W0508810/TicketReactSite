import { Routes, Route, Link } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import axios from 'axios'
import HomePage from './pages/HomePage'
import ShowDetailPage from './pages/ShowDetailPage'
import PurchasePage from './pages/PurchasePage'
import ConfirmationPage from './pages/ConfirmationPage'
import './App.css'

function App() {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch upcoming shows on app load
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:7205/api/shows/upcoming')
        setShows(response.data.data)
      } catch (err) {
        setError('Failed to load shows. Please try again later.')
        console.error('Error fetching shows:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
  }, [])

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            🎫 TicketFella
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                shows={shows} 
                loading={loading} 
                error={error} 
              />
            } 
          />
          <Route path="/shows/:id" element={<ShowDetailPage />} />
          <Route path="/purchase/:showId" element={<PurchasePage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>

        {/* Footer */}
        <footer className="mt-5 py-4 text-center text-muted border-top">
          <p className="mb-1">© 2024 TicketFella. All rights reserved.</p>
        </footer>
      </Container>
    </>
  )
}

export default App