import { render } from '@testing-library/react';
import { MatchView } from '../src/components/MatchView';

test('renders match view without crashing', () => {
  render(<MatchView />);
});
