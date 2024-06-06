import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../components/admin/admin';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // Mock empty plays array
    })
);

describe('Admin Component Test', () => {
    it('renders without crashing', () => {
        // Render the component
        render(
            <MemoryRouter>
                <Admin />
            </MemoryRouter>
        );
    });
});
