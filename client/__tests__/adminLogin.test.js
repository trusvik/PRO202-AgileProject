import React from 'react';
import { render } from '@testing-library/react';
import AdminLogin from '../components/admin/adminLogin';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), // Mock empty response
    })
);

describe('AdminLogin Component Test', () => {
    it('renders without crashing', () => {
        // Render the component
        render(<AdminLogin />);
    });
});
