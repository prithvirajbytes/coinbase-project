import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscribePanel } from '../src/components/SubscribePanel';

test('renders subscribe buttons', () => {
  render(<SubscribePanel />);
  expect(screen.getByText(/Subscribe BTC-USD/i)).toBeInTheDocument();
});
