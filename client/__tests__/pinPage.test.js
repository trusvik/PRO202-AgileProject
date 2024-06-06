import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom'; // to handle routing context
import PinPage from '../components/user/pinPage';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('PinPage Snapshot Test', () => {
    it('renders correctly', () => {
        const setIsAuthenticated = jest.fn(); // Mock function for setIsAuthenticated

        // Render the component
        const tree = renderer.create(
            <MemoryRouter>
                <PinPage setIsAuthenticated={setIsAuthenticated} />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
