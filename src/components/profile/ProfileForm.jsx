import React, { useEffect, useState } from 'react';
import { saveProfile } from '../../api/profile';
import { ProfileProvider, useProfile } from '../../hooks/useProfile';

const REQUIRED_FIELD_MESSAGE = 'This field is required.';
const PROFILE_SAVE_SUCCESS_MESSAGE = 'Profile saved successfully.';
const PROFILE_LOAD_ERROR_MESSAGE = 'Unable to load profile.';
const PROFILE_SAVE_ERROR_MESSAGE = 'Unable to save profile.';
const PROFILE_LOADING_MESSAGE = 'Loading your profile details.';
const PROFILE_EMPTY_TITLE = 'Start your profile';
const PROFILE_EMPTY_MESSAGE = 'Add your details to calculate targets and save progress.';

const FIELD_RANGES = {
  bodyWeightKg: { min: 40, max: 200, label: 'Body weight' },
  heightCm: { min: 140, max: 220, label: 'Height' },
  ageYears: { min: 18, max: 80, label: 'Age' },
};

const GENDER_OPTIONS = ['male', 'female', 'nonbinary', 'prefer_not_to_say'];
const ACTIVITY_OPTIONS = ['sedentary', 'light', 'moderate', 'active', 'athlete'];
const GOAL_OPTIONS = ['bulk', 'maintain', 'cut'];

function createInitialFormValues() {
  return {
    bodyWeightKg: '',
    heightCm: '',
    ageYears: '',
    gender: '',
    activityLevel: '',
    goal: '',
  };
}

function mapProfileToFormValues(profile) {
  if (!profile) {
    return createInitialFormValues();
  }

  return {
    bodyWeightKg: profile.bodyWeightKg != null ? String(profile.bodyWeightKg) : '',
    heightCm: profile.heightCm != null ? String(profile.heightCm) : '',
    ageYears: profile.ageYears != null ? String(profile.ageYears) : '',
    gender: profile.gender || '',
    activityLevel: profile.activityLevel || '',
    goal: profile.goal || '',
  };
}

function toNumericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function validateNumericField(value, key) {
  if (!value.trim()) {
    return REQUIRED_FIELD_MESSAGE;
  }

  const numericValue = toNumericValue(value);
  if (!Number.isFinite(numericValue)) {
    return `${FIELD_RANGES[key].label} must be a number.`;
  }

  const { min, max, label } = FIELD_RANGES[key];
  if (numericValue < min || numericValue > max) {
    return `${label} must be between ${min} and ${max}.`;
  }

  if (key === 'ageYears' && !Number.isInteger(numericValue)) {
    return 'Age must be an integer.';
  }

  return '';
}

function validateEnumField(value, allowedValues) {
  if (!value) {
    return REQUIRED_FIELD_MESSAGE;
  }
  return allowedValues.includes(value) ? '' : 'Selected value is invalid.';
}

function validateFormValues(formValues) {
  return {
    bodyWeightKg: validateNumericField(formValues.bodyWeightKg, 'bodyWeightKg'),
    heightCm: validateNumericField(formValues.heightCm, 'heightCm'),
    ageYears: validateNumericField(formValues.ageYears, 'ageYears'),
    gender: validateEnumField(formValues.gender, GENDER_OPTIONS),
    activityLevel: validateEnumField(formValues.activityLevel, ACTIVITY_OPTIONS),
    goal: validateEnumField(formValues.goal, GOAL_OPTIONS),
  };
}

function hasValidationErrors(validationErrors) {
  return Object.values(validationErrors).some((message) => Boolean(message));
}

function hasProfileValues(formValues) {
  return Object.values(formValues).some((value) => String(value).trim());
}

function shouldShowEmptyState({ isLoading, hasError, targets, formValues }) {
  if (isLoading || hasError || targets) {
    return false;
  }
  return !hasProfileValues(formValues);
}

function createProfilePayload(formValues) {
  return {
    bodyWeightKg: toNumericValue(formValues.bodyWeightKg),
    heightCm: toNumericValue(formValues.heightCm),
    ageYears: toNumericValue(formValues.ageYears),
    gender: formValues.gender,
    activityLevel: formValues.activityLevel,
    goal: formValues.goal,
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }
  return <p className="mt-1 text-sm text-rose-200">{message}</p>;
}

function StatusBanner({ message, role, tone, actionLabel, onAction }) {
  if (!message) {
    return null;
  }
  const styles =
    tone === 'error'
      ? 'profile-alert profile-alert--error'
      : 'profile-alert profile-alert--success';
  const action =
    actionLabel && onAction ? (
      <button type="button" className="profile-ghost-button" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null;

  return (
    <div role={role} className={styles}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        {action}
      </div>
    </div>
  );
}

function ProfileStateCard({ title, description }) {
  if (!title) {
    return null;
  }

  return (
    <div role="status" aria-live="polite" className="profile-state">
      <p className="profile-state-title">{title}</p>
      {description ? <p className="profile-state-body">{description}</p> : null}
    </div>
  );
}

function ProfileStatusSection({
  statusMessage,
  errorMessage,
  hasLoadError,
  onRetry,
  isLoading,
  isEmptyState,
}) {
  return (
    <>
      <StatusBanner message={statusMessage} role="status" tone="success" />
      <StatusBanner
        message={errorMessage}
        role="alert"
        tone="error"
        actionLabel={hasLoadError ? 'Retry' : null}
        onAction={hasLoadError ? onRetry : null}
      />
      {isLoading ? (
        <ProfileStateCard title={PROFILE_LOADING_MESSAGE} description="Fetching saved data." />
      ) : null}
      {!isLoading && isEmptyState ? (
        <ProfileStateCard title={PROFILE_EMPTY_TITLE} description={PROFILE_EMPTY_MESSAGE} />
      ) : null}
    </>
  );
}

function TargetsSummary({ targets }) {
  if (!targets) {
    return null;
  }

  return (
    <section className="profile-targets">
      <h3 className="profile-targets-title">Daily Targets (Calculated)</h3>
      <dl className="profile-targets-list">
        <div>
          <dt className="profile-targets-label">Calories</dt>
          <dd>{targets.calories} kcal</dd>
        </div>
        <div>
          <dt className="profile-targets-label">Protein</dt>
          <dd>{targets.proteinGrams} g</dd>
        </div>
        <div>
          <dt className="profile-targets-label">Carbs</dt>
          <dd>{targets.carbGrams} g</dd>
        </div>
        <div>
          <dt className="profile-targets-label">Fats</dt>
          <dd>{targets.fatGrams} g</dd>
        </div>
      </dl>
    </section>
  );
}

function NumericInputField({ id, label, value, onChange, error, isDisabled }) {
  return (
    <label className="auth-label" htmlFor={id}>
      {label}
      <input
        id={id}
        type="number"
        className="auth-input disabled:cursor-not-allowed disabled:opacity-60"
        value={value}
        onChange={onChange}
        disabled={isDisabled}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectInputField({ id, label, value, onChange, options, placeholder, error, isDisabled }) {
  return (
    <label className="auth-label" htmlFor={id}>
      {label}
      <select
        id={id}
        className="auth-input disabled:cursor-not-allowed disabled:opacity-60"
        value={value}
        onChange={onChange}
        disabled={isDisabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function ProfileFields({ formValues, validationErrors, onFieldChange, isDisabled }) {
  return (
    <>
      <div className="profile-grid">
        <NumericInputField
          id="bodyWeightKg"
          label="Weight (kg)"
          value={formValues.bodyWeightKg}
          onChange={onFieldChange('bodyWeightKg')}
          error={validationErrors.bodyWeightKg}
          isDisabled={isDisabled}
        />
        <NumericInputField
          id="heightCm"
          label="Height (cm)"
          value={formValues.heightCm}
          onChange={onFieldChange('heightCm')}
          error={validationErrors.heightCm}
          isDisabled={isDisabled}
        />
        <NumericInputField
          id="ageYears"
          label="Age"
          value={formValues.ageYears}
          onChange={onFieldChange('ageYears')}
          error={validationErrors.ageYears}
          isDisabled={isDisabled}
        />
      </div>
      <div className="profile-grid">
        <SelectInputField
          id="gender"
          label="Gender"
          value={formValues.gender}
          onChange={onFieldChange('gender')}
          options={GENDER_OPTIONS}
          placeholder="Select gender"
          error={validationErrors.gender}
          isDisabled={isDisabled}
        />
        <SelectInputField
          id="activityLevel"
          label="Training Level"
          value={formValues.activityLevel}
          onChange={onFieldChange('activityLevel')}
          options={ACTIVITY_OPTIONS}
          placeholder="Select activity"
          error={validationErrors.activityLevel}
          isDisabled={isDisabled}
        />
        <SelectInputField
          id="goal"
          label="Goal"
          value={formValues.goal}
          onChange={onFieldChange('goal')}
          options={GOAL_OPTIONS}
          placeholder="Select goal"
          error={validationErrors.goal}
          isDisabled={isDisabled}
        />
      </div>
    </>
  );
}

function useProfileHydration(profile, setFormValues) {
  useEffect(() => {
    if (!profile) {
      return;
    }
    setFormValues(mapProfileToFormValues(profile));
  }, [profile, setFormValues]);
}

function createFieldChangeHandler(
  setFormValues,
  setValidationErrors,
  setStatusMessage,
  setErrorMessage
) {
  return (fieldName) => (event) => {
    setFormValues((values) => ({ ...values, [fieldName]: event.target.value }));
    setValidationErrors((errors) => ({ ...errors, [fieldName]: '' }));
    setStatusMessage('');
    setErrorMessage('');
  };
}

function createRecalculateHandler({
  formValues,
  setValidationErrors,
  setStatusMessage,
  setErrorMessage,
  setFormValues,
  setTargets,
  setIsSaving,
}) {
  return async (event) => {
    event.preventDefault();
    const nextErrors = validateFormValues(formValues);
    setValidationErrors(nextErrors);
    setStatusMessage('');
    setErrorMessage('');
    if (hasValidationErrors(nextErrors)) return;

    setIsSaving(true);
    try {
      const response = await saveProfile(createProfilePayload(formValues));
      if (response?.profile) setFormValues(mapProfileToFormValues(response.profile));
      setTargets(response?.targets || null);
      setStatusMessage(PROFILE_SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      setErrorMessage(error?.message || PROFILE_SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  };
}

function useProfileFormController() {
  const { profile, targets, isLoading, error, refetchProfile } = useProfile();
  const [formValues, setFormValues] = useState(createInitialFormValues);
  const [validationErrors, setValidationErrors] = useState(createInitialFormValues);
  const [localTargets, setLocalTargets] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useProfileHydration(profile, setFormValues);

  const handleFieldChange = createFieldChangeHandler(
    setFormValues,
    setValidationErrors,
    setStatusMessage,
    setErrorMessage
  );

  const handleRecalculateTargets = createRecalculateHandler({
    formValues,
    setValidationErrors,
    setStatusMessage,
    setErrorMessage,
    setFormValues,
    setTargets: setLocalTargets,
    setIsSaving,
  });

  const resolvedTargets = localTargets || targets;
  const hasLoadError = Boolean(error);
  const loadErrorMessage = hasLoadError ? PROFILE_LOAD_ERROR_MESSAGE : '';
  const displayedError = errorMessage || loadErrorMessage;
  const isEmptyState = shouldShowEmptyState({
    isLoading,
    hasError: Boolean(loadErrorMessage),
    targets: resolvedTargets,
    formValues,
  });

  return {
    formValues,
    validationErrors,
    targets: resolvedTargets,
    isSaving,
    isLoading,
    statusMessage,
    errorMessage: displayedError,
    isEmptyState,
    hasLoadError,
    refetchProfile,
    handleFieldChange,
    handleRecalculateTargets,
  };
}

function ProfileFormLayout({
  formValues,
  validationErrors,
  targets,
  isSaving,
  isLoading,
  statusMessage,
  errorMessage,
  isEmptyState,
  hasLoadError,
  refetchProfile,
  handleFieldChange,
  handleRecalculateTargets,
}) {
  return (
    <section className="profile-shell">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-title">Current Profile</h2>
          <p className="profile-subtitle">Update your profile and recalculate macro targets.</p>
        </div>
        <ProfileStatusSection
          statusMessage={statusMessage}
          errorMessage={errorMessage}
          hasLoadError={hasLoadError}
          onRetry={refetchProfile}
          isLoading={isLoading}
          isEmptyState={isEmptyState}
        />
        <form className="profile-form" onSubmit={handleRecalculateTargets} noValidate>
          <ProfileFields
            formValues={formValues}
            validationErrors={validationErrors}
            onFieldChange={handleFieldChange}
            isDisabled={isSaving}
          />
          <div className="profile-actions">
            <button type="submit" className="profile-button" disabled={isSaving}>
              Recalculate Targets
            </button>
          </div>
        </form>
        <TargetsSummary targets={targets} />
      </div>
    </section>
  );
}

/**
 * Renders onboarding/settings profile form and recalculates targets through profile API.
 * @returns {JSX.Element}
 */
function ProfileFormContent() {
  const controller = useProfileFormController();
  return (
    <ProfileFormLayout
      formValues={controller.formValues}
      validationErrors={controller.validationErrors}
      targets={controller.targets}
      isSaving={controller.isSaving}
      isLoading={controller.isLoading}
      statusMessage={controller.statusMessage}
      errorMessage={controller.errorMessage}
      isEmptyState={controller.isEmptyState}
      hasLoadError={controller.hasLoadError}
      refetchProfile={controller.refetchProfile}
      handleFieldChange={controller.handleFieldChange}
      handleRecalculateTargets={controller.handleRecalculateTargets}
    />
  );
}

/**
 * Renders onboarding/settings profile form and recalculates targets through profile API.
 * @returns {JSX.Element}
 */
export default function ProfileForm() {
  return (
    <ProfileProvider>
      <ProfileFormContent />
    </ProfileProvider>
  );
}
