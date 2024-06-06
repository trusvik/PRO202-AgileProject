import React from 'react';
import { render } from '@testing-library/react';
import EditPlay from '../components/admin/editPlay';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: 'test_id' }), // Mock id parameter
    useNavigate: () => jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ play: '', scenarios: [] }), // Mock empty play and scenarios
    })
);

describe('EditPlay Component Test', () => {
    it('renders without crashing', async () => {
        // Render the component
        render(<EditPlay />);
    });
});
