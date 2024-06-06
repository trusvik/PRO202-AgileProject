import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import ResultPage from '../components/admin/resultPage';

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // Mock empty response
    })
);

describe('ResultPage Snapshot Test', () => {
    it('renders correctly', async () => {
        // Mock useParams
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useParams: () => ({ playId: '1', scenarioId: '1' }),
            useNavigate: () => jest.fn(),
        }));

        // Render the component within MemoryRouter
        const tree = renderer.create(
            <MemoryRouter>
                <ResultPage />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
