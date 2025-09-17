import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Coinbase Pro WebSocket Viewer heading', () => {
  render(<App />);
  const heading = screen.getByText(/Coinbase Pro WebSocket Viewer/i);
  expect(heading).toBeInTheDocument();
});
