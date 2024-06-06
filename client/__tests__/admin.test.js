import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for the extended matchers
import { BrowserRouter } from 'react-router-dom';
import Admin from '../components/admin/admin';

test('renders Admin component without crashing', () => {
    render(
        <BrowserRouter>
            <Admin />
        </BrowserRouter>
    );
});
