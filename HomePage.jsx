import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Card, Button, Spinner, Form } from 'react-bootstrap'

function HomePage({ shows, loading, error }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [imageErrors, setImageErrors] = useState({})

  // Handle image loading errors
  const handleImageError = (showId) => {
    setImageErrors(prev => ({ ...prev, [showId]: true }))
  }

  // Get the image for a show
  const getShowImage = (show) => {
    // If image failed to load, use default
    if (imageErrors[show.ShowId]) {
      return '/images/shows/default.jpg'
    }
    
    // If show has an image in database, use it
    if (show.ImageFileName) {
      return show.ImageFileName
    }
    
    // Otherwise use default image based on category
    const defaultImages = {
      'Concert': '/images/shows/concerts/concert1.jpg',
      'Sports': '/images/shows/sports/sports1.jpg',
      'Theater': '/images/shows/theater/theater1.jpg',
      'Comedy': '/images/shows/comedy/comedy1.jpg',
      'Family': '/images/shows/family/family1.jpg'
    }
    
    return defaultImages[show.Category] || '/images/shows/default.jpg'
  }

  // Filter shows based on search and category
  const filteredShows = shows.filter(show => {
    const matchesSearch = show.ShowName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         show.Venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         show.Category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryFilter || show.Category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = [...new Set(shows.map(show => show.Category))]

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading upcoming shows...</span>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">Find your next event</h1>
        <p className="lead mb-4">Find concerts, sports, theater, and more.</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-5">
        <Row className="g-3">
          <Col md={8}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="text"
                placeholder="Search shows, venues, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </Col>
          <Col md={4}>
            <Form.Select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Shows Grid */}
      <div id="shows">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">🎟️ Upcoming Shows <span className="text-muted fs-4">({filteredShows.length})</span></h2>
          <div className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Click on any show for details
          </div>
        </div>
        
        {filteredShows.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-search display-1 text-muted"></i>
            </div>
            <h4 className="mb-2">No shows found</h4>
            <p className="text-muted mb-4">Try adjusting your search or filter</p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredShows.map(show => {
              const showImage = getShowImage(show)
              const isSoldOut = show.AvailableTickets === 0
              
              return (
                <Col key={show.ShowId}>
                  <Card className="show-card h-100 border-0 shadow-sm">
                    {/* Image Section */}
                    <div className="show-image-container position-relative">
                      <Card.Img 
                        variant="top" 
                        src={showImage}
                        className="show-image"
                        alt={show.ShowName}
                        onError={() => handleImageError(show.ShowId)}
                      />
                      
                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="sold-out-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <div className="sold-out-badge bg-danger text-white px-3 py-2 rounded">
                            <i className="bi bi-x-circle me-1"></i> SOLD OUT
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <span className="category-badge position-absolute top-0 start-0 m-3">
                        <span className="badge bg-dark bg-opacity-75">
                          {show.Category}
                        </span>
                      </span>
                      
                      {/* Available Tickets Badge */}
                      {!isSoldOut && show.AvailableTickets > 0 && (
                        <span className="available-badge position-absolute top-0 end-0 m-3">
                          <span className="badge bg-success">
                            {show.AvailableTickets} left
                          </span>
                        </span>
                      )}
                    </div>
                    
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(show.ShowDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          <span className="mx-1">•</span>
                          <i className="bi bi-clock me-1"></i>
                          {new Date(show.ShowDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      
                      <Card.Title className="h5 mb-2 flex-grow-1">{show.ShowName}</Card.Title>
                      
                      <Card.Text className="text-muted small mb-3">
                        <i className="bi bi-geo-alt me-1"></i>
                        {show.Venue}
                      </Card.Text>
                      
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="text-muted small">From</span>
                            <div className="h4 text-success mb-0">${show.TicketPrice}</div>
                          </div>
                          
                          <div className="text-end">
                            {isSoldOut ? (
                              <span className="badge bg-danger">Sold Out</span>
                            ) : show.AvailableTickets < 10 ? (
                              <span className="badge bg-warning text-dark">Almost Gone</span>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button 
                            as={Link} 
                            to={`/shows/${show.ShowId}`}
                            variant="outline-primary"
                            size="sm"
                            className="flex-grow-1"
                          >
                            <i className="bi bi-info-circle me-1"></i>
                            Details
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/purchase/${show.ShowId}`}
                            variant="primary"
                            size="sm"
                            className="flex-grow-1"
                            disabled={isSoldOut}
                          >
                            {isSoldOut ? (
                              <>
                                <i className="bi bi-x-circle me-1"></i>
                                Sold Out
                              </>
                            ) : (
                              <>
                                <i className="bi bi-ticket-perforated me-1"></i>
                                Buy Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}
      </div>

      {/* Footer Stats */}
      {filteredShows.length > 0 && (
        <div className="mt-5 pt-4 border-top">
          <Row className="text-center">
            <Col xs={6} md={3}>
              <div className="h3 text-primary">{filteredShows.length}</div>
              <div className="text-muted">Total Shows</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="h3 text-success">
                {filteredShows.reduce((sum, show) => sum + show.AvailableTickets, 0)}
              </div>
              <div className="text-muted">Available Tickets</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="h3 text-info">{categories.length}</div>
              <div className="text-muted">Categories</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="h3 text-warning">
                {new Set(filteredShows.map(show => show.Venue)).size}
              </div>
              <div className="text-muted">Venues</div>
            </Col>
          </Row>
        </div>
      )}
    </>
  )
}

export default HomePage