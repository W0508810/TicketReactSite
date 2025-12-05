import { useLocation, Link } from 'react-router-dom'
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap'
import { CheckCircleFill, Envelope, Printer } from 'react-bootstrap-icons'

function ConfirmationPage() {
  const location = useLocation()
  const { order, customerName, customerEmail, showName } = location.state || {}

  if (!order) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>No Order Found</Alert.Heading>
          <p>It seems you arrived here without completing a purchase.</p>
          <Button as={Link} to="/" variant="outline-warning">
            Browse Shows
          </Button>
        </Alert>
      </Container>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Container className="my-5">
      <div className="text-center mb-5">
        <CheckCircleFill className="text-success" size={80} />
        <h1 className="mt-3">Order Confirmed!</h1>
        <p className="lead">Thank you for your purchase, {customerName}!</p>
      </div>

      <Card className="mb-4 shadow">
        <Card.Body>
          <Card.Title>Order Details</Card.Title>
          <Row>
            <Col md={6}>
              <p><strong>Order Number:</strong> #{order.OrderId}</p>
              <p><strong>Show:</strong> {showName}</p>
              <p><strong>Date:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
            </Col>
            <Col md={6}>
              <p><strong>Customer:</strong> {customerName}</p>
              <p><strong>Email:</strong> {customerEmail}</p>
              <p><strong>Confirmation:</strong> Sent to your email</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Alert variant="success">
        <Alert.Heading>What's Next?</Alert.Heading>
        <ul className="mb-0">
          <li>Your e-ticket has been sent to <strong>{customerEmail}</strong></li>
          <li>Please bring your confirmation email and ID to the venue</li>
          <li>Doors open 1 hour before the show</li>
          <li>Need help? Contact support@ticketscam.com</li>
        </ul>
      </Alert>

      <div className="d-flex justify-content-center gap-3 mt-5">
        <Button as={Link} to="/" variant="primary" size="lg">
          Browse More Shows
        </Button>
        <Button variant="outline-secondary" size="lg" onClick={handlePrint}>
          <Printer className="me-2" />
          Print Confirmation
        </Button>
        <Button variant="outline-info" size="lg">
          <Envelope className="me-2" />
          Resend Email
        </Button>
      </div>

      <div className="text-center mt-5 text-muted">
        <small>
          Need to make changes to your order?<br />
          Contact our support team at support@ticketscam.com or call 1-800-TICKETS
        </small>
      </div>
    </Container>
  )
}

export default ConfirmationPage