import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfileForm from '../../../src/components/profile/ProfileForm';

jest.mock('../../../src/api/profile', () => ({
  fetchProfile: jest.fn(),
  saveProfile: jest.fn(),
}));

const { fetchProfile, saveProfile } = require('../../../src/api/profile');

const VALID_PROFILE_INPUT = {
  bodyWeightKg: '78',
  heightCm: '183',
  ageYears: '34',
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'bulk',
};

const CALCULATED_TARGETS = {
  proteinGrams: 180,
  carbGrams: 360,
  fatGrams: 79,
  calories: 2875,
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/weight/i), {
    target: { value: VALID_PROFILE_INPUT.bodyWeightKg },
  });
  fireEvent.change(screen.getByLabelText(/height/i), {
    target: { value: VALID_PROFILE_INPUT.heightCm },
  });
  fireEvent.change(screen.getByLabelText(/age/i), {
    target: { value: VALID_PROFILE_INPUT.ageYears },
  });
  fireEvent.change(screen.getByLabelText(/gender/i), {
    target: { value: VALID_PROFILE_INPUT.gender },
  });
  fireEvent.change(screen.getByLabelText(/training|activity/i), {
    target: { value: VALID_PROFILE_INPUT.activityLevel },
  });
  fireEvent.change(screen.getByLabelText(/goal/i), {
    target: { value: VALID_PROFILE_INPUT.goal },
  });
}

describe('ProfileForm', () => {
  beforeEach(() => {
    fetchProfile.mockReset();
    saveProfile.mockReset();
    fetchProfile.mockResolvedValue({
      success: true,
      profile: null,
      targets: null,
    });
  });

  test('shows validation errors when required fields are missing', async () => {
    // Arrange
    render(<ProfileForm />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /recalculate targets/i }));

    // Assert
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
    expect(saveProfile).not.toHaveBeenCalled();
  });

  test('shows error banner when profile load fails', async () => {
    // Arrange
    fetchProfile.mockRejectedValue(new Error('load failed'));

    // Act
    render(<ProfileForm />);

    // Assert
    expect(await screen.findByText(/unable to load profile/i)).toBeInTheDocument();
  });

  test('prefills form fields and targets when profile data is available', async () => {
    // Arrange
    fetchProfile.mockResolvedValue({
      success: true,
      profile: {
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      },
      targets: CALCULATED_TARGETS,
    });

    // Act
    render(<ProfileForm />);

    // Assert
    expect(await screen.findByDisplayValue('78')).toBeInTheDocument();
    expect(screen.getByDisplayValue('183')).toBeInTheDocument();
    expect(screen.getByDisplayValue('34')).toBeInTheDocument();
    expect(screen.getByDisplayValue('male')).toBeInTheDocument();
    expect(screen.getByDisplayValue('moderate')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bulk')).toBeInTheDocument();
    expect(screen.getByText(/2875 kcal/i)).toBeInTheDocument();
  });

  test('triggers profile save when recalculate targets is clicked', async () => {
    // Arrange
    saveProfile.mockResolvedValue({
      success: true,
      profile: {
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      },
      targets: CALCULATED_TARGETS,
    });
    render(<ProfileForm />);
    fillRequiredFields();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /recalculate targets/i }));

    // Assert
    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledWith({
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      });
    });
  });

  test('shows integer validation error for age input', async () => {
    // Arrange
    render(<ProfileForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '34.5' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /recalculate targets/i }));

    // Assert
    expect(await screen.findByText(/age must be an integer/i)).toBeInTheDocument();
    expect(saveProfile).not.toHaveBeenCalled();
  });

  test('shows success banner after profile save succeeds', async () => {
    // Arrange
    saveProfile.mockResolvedValue({
      success: true,
      profile: {
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      },
      targets: CALCULATED_TARGETS,
    });
    render(<ProfileForm />);
    fillRequiredFields();

    // Act
    fireEvent.click(screen.getByRole('button', { name: /recalculate targets/i }));

    // Assert
    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledWith({
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'bulk',
      });
    });
    expect(await screen.findByText(/saved successfully|profile saved/i)).toBeInTheDocument();
    expect(screen.getByText(/calories/i)).toBeInTheDocument();
    expect(screen.getByText(/2875 kcal/i)).toBeInTheDocument();
    expect(screen.getByText(/protein/i)).toBeInTheDocument();
    expect(screen.getByText(/180 g/i)).toBeInTheDocument();
  });
});
