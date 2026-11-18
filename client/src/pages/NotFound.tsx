import { Link } from 'react-router';

export function NotFound() {
  return (
    <section>
      <h2>Page not found</h2>
      <p>
        This address does not belong to ClinicBook. <Link to="/">Back to the agenda</Link>
      </p>
    </section>
  );
}
