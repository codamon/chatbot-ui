import React from 'react';
import { render, screen } from '@testing-library/react';
import RegistrationSuccess from '../../pages/auth/RegistrationSuccess';

describe('RegistrationSuccess', () => {
    it('renders the title and message', () => {
        render(<RegistrationSuccess />);

        expect(screen.getByText('Registration Successful')).toBeInTheDocument();
        expect(screen.getByText('Your account has been created successfully! Please log in to continue.')).toBeInTheDocument();
    });

    it('renders the Go to Login button', () => {
        render(<RegistrationSuccess />);

        expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });
});
