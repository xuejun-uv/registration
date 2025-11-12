import { render, screen } from '@testing-library/react';
import App from './App';

test('renders School of Technology title', () => {
  render(<App />);
  const titleElement = screen.getByText(/School of Technology/i);
  expect(titleElement).toBeInTheDocument();
});
