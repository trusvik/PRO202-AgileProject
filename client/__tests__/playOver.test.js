import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import PlayOver from '../components/admin/playOver';

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), // Mock empty response
    })
);

describe('PlayOver Snapshot Test', () => {
    it('renders correctly', async () => {
        // Render the component within MemoryRouter
        const tree = renderer.create(
            <MemoryRouter>
                <PlayOver />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
