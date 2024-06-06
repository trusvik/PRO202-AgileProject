import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import CreateNew from '../components/admin/createNew';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('CreateNew Snapshot Test', () => {
    it('renders correctly', () => {
        // Render the component
        const tree = renderer.create(
            <MemoryRouter>
                <CreateNew />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});

