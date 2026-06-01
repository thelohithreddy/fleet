import { render, screen } from '@testing-library/react';
import Appadmin from './Appadmin';

test('renders learn react link', () => {
  render(<Appadmin />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
