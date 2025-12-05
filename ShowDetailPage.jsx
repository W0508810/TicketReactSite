import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap'
import axios from 'axios'

function ShowDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)

  // Function to get the appropriate image for a show
  const getShowImage = (show) => {
    if (!show) return '/images/shows/default.jpg'
    
    // If show has a specific image in database, use it
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

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:7205/api/shows/${id}`)
        setShow(response.data.data)
      } catch (err) {
        setError('Failed to load show details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShow()
  }, [id])

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading show details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button as={Link} to="/" variant="outline-danger">
          Back to Home
        </Button>
      </Alert>
    )
  }

  if (!show) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Show Not Found</Alert.Heading>
        <p>The show you're looking for doesn't exist or has been removed.</p>
        <Button as={Link} to="/" variant="outline-warning">
          Browse Available Shows
        </Button>
      </Alert>
    )
  }

  const showImage = getShowImage(show)

  return (
    <Container>
      <Button 
        variant="link" 
        onClick={() => navigate(-1)}
        className="mb-3 ps-0 text-decoration-none"
      >
        ← Back to Shows
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <div className="position-relative">
              <Card.Img 
                variant="top" 
                src={imageError ? '/images/shows/default.jpg' : showImage}
                className="detail-image"
                alt={show.ShowName}
                onError={() => setImageError(true)}
                style={{ 
                  height: '400px', 
                  objectFit: 'cover',
                  width: '100%'
                }}
              />
              <div className="position-absolute top-0 start-0 m-3">
                <Badge bg="dark" className="fs-6 py-2 px-3">
                  {show.Category}
                </Badge>
              </div>
            </div>
            
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1 me-3">
                  <h1 className="mb-2">{show.ShowName}</h1>
                  <div className="d-flex align-items-center text-muted mb-3">
                    <i className="bi bi-geo-alt me-2"></i>
                    <span>{show.Venue} • {show.VenueLocation}</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-muted small">Starting at</div>
                  <h2 className="text-success mb-0">${show.TicketPrice}</h2>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="mb-2">📅 Date & Time</h5>
                <Card.Text className="fs-5">
                  {new Date(show.ShowDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  <br />
                  <span className="text-muted">
                    {new Date(show.ShowDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • Doors open 1 hour before show
                  </span>
                </Card.Text>
              </div>

              <div className="mb-4">
                <h5 className="mb-2">📍 Venue Details</h5>
                <Card.Text>
                  <strong>{show.Venue}</strong><br />
                  {show.VenueLocation}<br />
                  <small className="text-muted">
                    <i className="bi bi-people me-1"></i>
                    Capacity: {show.VenueCapacity?.toLocaleString() || 'N/A'} seats
                  </small>
                </Card.Text>
              </div>

              {show.ShowDescription && (
                <div className="mb-4">
                  <h5 className="mb-2">📝 About This Show</h5>
                  <Card.Text className="fs-6">
                    {show.ShowDescription}
                  </Card.Text>
                </div>
              )}

              <div className="alert alert-info mt-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                  <div>
                    <strong>Important Information:</strong><br />
                    <small>
                      • This ticket is valid for the date and time specified only<br />
                      • No refunds or exchanges<br />
                      • All sales are final<br />
                      • Valid ID required for entry
                    </small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <Card.Title className="mb-4">Purchase Tickets</Card.Title>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                  <div>
                    <div className="text-muted small">Price per ticket</div>
                    <div className="fs-4 fw-bold text-success">${show.TicketPrice}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">Available</div>
                    <div className={`fs-4 fw-bold ${show.AvailableTickets === 0 ? 'text-danger' : 'text-success'}`}>
                      {show.AvailableTickets}
                    </div>
                  </div>
                </div>

                {show.AvailableTickets > 0 ? (
                  <>
                    <div className="alert alert-success mb-4">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <strong>Tickets Available!</strong>
                      <div className="small mt-1">Secure your spot before they sell out</div>
                    </div>
                    
                    <Button 
                      as={Link}
                      to={`/purchase/${id}`}
                      variant="primary"
                      size="lg"
                      className="w-100 py-3 mb-3"
                    >
                      <i className="bi bi-ticket-perforated me-2"></i>
                      Buy Tickets Now
                    </Button>
                  </>
                ) : (
                  <Alert variant="warning">
                    <Alert.Heading className="fs-5">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Sold Out!
                    </Alert.Heading>
                    <p className="mb-0">This show is currently sold out. Check back for cancellations.</p>
                  </Alert>
                )}
              </div>

              <hr className="my-4" />

              <div className="small text-muted">
                <div className="d-flex mb-2">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <span>Secure checkout with 256-bit encryption</span>
                </div>
                <div className="d-flex mb-2">
                  <i className="bi bi-lightning-charge text-warning me-2"></i>
                  <span>Instant e-ticket delivery</span>
                </div>
                <div className="d-flex mb-2">
                  <i className="bi bi-headset text-primary me-2"></i>
                  <span>24/7 customer support</span>
                </div>
                <div className="d-flex">
                  <i className="bi bi-arrow-clockwise text-info me-2"></i>
                  <span>Easy mobile ticket management</span>
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="w-100"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-2"></i>
                  Print Show Details
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Additional Info Card */}
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Card.Title className="fs-5 mb-3">Need Help?</Card.Title>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-question-circle text-primary me-2"></i>
                  <a href="#" className="text-decoration-none">FAQs & Help Center</a>
                </li>
                <li className="mb-2">
                  <i className="bi bi-telephone text-success me-2"></i>
                  <span>Call: 1-800-TICKETS</span>
                </li>
                <li>
                  <i className="bi bi-envelope text-info me-2"></i>
                  <a href="mailto:support@ticketscam.com" className="text-decoration-none">
                    support@ticketscam.com
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ShowDetailPage