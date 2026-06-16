import { render } from '@testing-library/react'
import Home from './page'
import { redirect } from 'next/navigation'

// Since page uses `redirect`, we have to mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Home Redirect', () => {
  it('calls redirect to /services on mount', () => {
    render(<Home />)
    expect(redirect).toHaveBeenCalledWith('/services')
  })
})
