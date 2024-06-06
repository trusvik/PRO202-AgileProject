// WaitingRoom.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import WaitingRoom from '../components/user/waitingRoom';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock the WebSocket
global.WebSocket = jest.fn(() => ({
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onclose: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
}));

describe('WaitingRoom Snapshot Test', () => {
    it('renders correctly', () => {
        sessionStorage.setItem('names', JSON.stringify(['Player1', 'Player2'])); // Mock session storage

        // Render the component
        const tree = renderer.create(
            <MemoryRouter>
                <WaitingRoom />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
