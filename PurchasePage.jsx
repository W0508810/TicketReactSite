import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap'
import axios from 'axios'

function PurchasePage() {
  const { showId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(null)
  const [availableTickets, setAvailableTickets] = useState([])
  const [formData, setFormData] = useState({
    userId: '',
    ticketId: '',
    useCustomPayment: false,
    customCardNumber: '',
    customCardHolder: '',
    customCardExpiry: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch show details
        const showResponse = await axios.get(`http://localhost:7205/api/shows/${showId}`)
        setShow(showResponse.data.data)
        
        // Fetch available tickets for this show
       // Replace the tickets fetch with:
const ticketsResponse = await axios.get(`http://localhost:7205/api/shows/${showId}/tickets`)
setAvailableTickets(ticketsResponse.data.data)
        
        // Pre-select first available ticket if exists
        if (showTickets.length > 0) {
          setFormData(prev => ({
            ...prev,
            ticketId: showTickets[0].TicketId
          }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Customer info validation
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required'
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'Email is invalid'
    
    // Ticket selection
    if (!formData.ticketId) newErrors.ticketId = 'Please select a ticket'
    
    // Payment validation
    if (formData.useCustomPayment) {
      if (!formData.customCardNumber.trim()) newErrors.customCardNumber = 'Card number is required'
      else if (!/^\d{16}$/.test(formData.customCardNumber.replace(/\s/g, ''))) newErrors.customCardNumber = 'Card number must be 16 digits'
      
      if (!formData.customCardHolder.trim()) newErrors.customCardHolder = 'Card holder name is required'
      
      if (!formData.customCardExpiry.trim()) newErrors.customCardExpiry = 'Expiry date is required'
      else if (!/^\d{2}\/\d{2}$/.test(formData.customCardExpiry)) newErrors.customCardExpiry = 'Format must be MM/YY'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      // In a real app, you'd create the user first or use existing user ID
      // For now, we'll use a dummy userId
      const orderData = {
        userId: 1, // Hardcoded for demo - should come from authentication
        ticketId: formData.ticketId,
        useCustomPayment: formData.useCustomPayment,
        customCardNumber: formData.useCustomPayment ? formData.customCardNumber.replace(/\s/g, '') : null,
        customCardHolder: formData.useCustomPayment ? formData.customCardHolder : null,
        customCardExpiry: formData.useCustomPayment ? formData.customCardExpiry : null
      }

      const response = await axios.post('http://localhost:7205/api/orders', orderData)
      
      // Navigate to confirmation page with order details
      navigate('/confirmation', { 
        state: { 
          order: response.data.data,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          showName: show?.ShowName
        }
      })
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to process purchase. Please try again.')
      console.error('Purchase error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading purchase details...</span>
      </div>
    )
  }

  if (!show) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>Show not found</p>
      </Alert>
    )
  }

  if (availableTickets.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>No Tickets Available</Alert.Heading>
          <p>Sorry, all tickets for this show are currently sold out.</p>
          <Button variant="outline-warning" onClick={() => navigate(-1)}>
            Back to Show
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container>
      <Button 
        variant="link" 
        onClick={() => navigate(-1)}
        className="mb-4 ps-0"
      >
        ← Back to Show
      </Button>

      <h1 className="mb-4">Purchase Tickets</h1>
      
      <Row>
        <Col lg={8}>
          <div className="form-container">
            {submitError && (
              <Alert variant="danger" dismissible onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Show Info */}
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>{show.ShowName}</Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {new Date(show.ShowDate).toLocaleDateString()}<br />
                    <strong>Venue:</strong> {show.Venue}<br />
                    <strong>Price per ticket:</strong> ${show.TicketPrice}
                  </Card.Text>
                </Card.Body>
              </Card>

              {/* Ticket Selection */}
              <Form.Group className="mb-4">
                <Form.Label>Select Ticket *</Form.Label>
                <Form.Select
                  name="ticketId"
                  value={formData.ticketId}
                  onChange={handleChange}
                  isInvalid={!!errors.ticketId}
                  required
                >
                  <option value="">Choose a ticket...</option>
                  {availableTickets.map(ticket => (
                    <option key={ticket.TicketId} value={ticket.TicketId}>
                      Seat {ticket.SeatNumber} - ${ticket.Price}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.ticketId}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Customer Information */}
              <h4 className="mb-3">Customer Information</h4>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      isInvalid={!!errors.customerName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customerName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      isInvalid={!!errors.customerEmail}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customerEmail}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </Form.Group>

              {/* Payment Information */}
              <h4 className="mb-3">Payment Information</h4>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Use different payment method"
                  name="useCustomPayment"
                  checked={formData.useCustomPayment}
                  onChange={handleChange}
                />
              </Form.Group>

              {formData.useCustomPayment && (
                <>
                  <Row className="mb-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Card Number *</Form.Label>
                        <Form.Control
                          type="text"
                          name="customCardNumber"
                          value={formData.customCardNumber}
                          onChange={(e) => {
                            handleChange({
                              target: {
                                name: 'customCardNumber',
                                value: formatCardNumber(e.target.value)
                              }
                            })
                          }}
                          placeholder="1234 5678 9012 3456"
                          isInvalid={!!errors.customCardNumber}
                          maxLength={19}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.customCardNumber}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Expiry (MM/YY) *</Form.Label>
                        <Form.Control
                          type="text"
                          name="customCardExpiry"
                          value={formData.customCardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length >= 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4)
                            }
                            handleChange({
                              target: {
                                name: 'customCardExpiry',
                                value: value
                              }
                            })
                          }}
                          placeholder="MM/YY"
                          isInvalid={!!errors.customCardExpiry}
                          maxLength={5}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.customCardExpiry}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Card Holder Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="customCardHolder"
                      value={formData.customCardHolder}
                      onChange={handleChange}
                      isInvalid={!!errors.customCardHolder}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.customCardHolder}
                    </Form.Control.Feedback>
                  </Form.Group>
                </>
              )}

              <div className="d-grid gap-2">
                <Button 
                  type="submit" 
                  variant="success" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : (
                    `Complete Purchase - $${availableTickets.find(t => t.TicketId == formData.ticketId)?.Price || show.TicketPrice}`
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-muted mt-3 small">
                * Required fields<br />
                Your payment is secured with 256-bit SSL encryption
              </p>
            </Form>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Ticket Price:</span>
                <span>${show.TicketPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Service Fee:</span>
                <span>$5.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>${(show.TicketPrice + 5).toFixed(2)}</strong>
              </div>
              
              <Card.Text className="small text-muted">
                <strong>What's included:</strong>
                <ul className="mt-2">
                  <li>Electronic ticket delivery</li>
                  <li>24/7 customer support</li>
                  <li>Instant confirmation</li>
                  <li>Secure payment processing</li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default PurchasePage