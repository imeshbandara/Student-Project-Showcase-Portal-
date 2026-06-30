import { Link } from 'react-router-dom';

/**
 * NotFoundPage — displayed for any unmatched route (404).
 */
export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn--primary" id="not-found-home-link">
          Go Home
        </Link>
      </div>
    </div>
  );
}
