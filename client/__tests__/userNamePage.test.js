// UserNamePage.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import UserNamePage from '../components/user/userNamePage';

// Mock the `useNavigate` hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('UserNamePage Snapshot Test', () => {
    it('renders correctly', () => {
        const setIsUserNameEntered = jest.fn(); // Mock function for setIsUserNameEntered

        // Render the component
        const tree = renderer.create(
            <MemoryRouter>
                <UserNamePage setIsUserNameEntered={setIsUserNameEntered} />
            </MemoryRouter>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
