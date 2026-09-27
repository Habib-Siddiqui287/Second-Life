import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

/*
 * Worldwide country selector.
 *
 * IMPORTANT:
 * - Do NOT pass only a small list of countries to this component.
 * - react-phone-input-2 supplies the complete international country list.
 * - Search is enabled.
 * - Flags + country names + calling codes are shown in the dropdown.
 */

const normalizeCountry = (country) => {
  const value = String(country || 'PK').trim().toLowerCase();
  return value.length === 2 ? value : 'pk';
};

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

const isReasonablePhone = (value) => {
  const digits = digitsOnly(value);
  return digits.length >= 7 && digits.length <= 15;
};

export default function PhoneCountryInput({
  value = '',
  country = 'PK',
  onChange,
  onCountryChange,
  error = '',
  label = 'Contact number',
  required = true,
  disabled = false,
}) {
  const selectedCountry = normalizeCountry(country);

  const handleChange = (phone, countryData) => {
    const digits = digitsOnly(phone);
    const normalizedPhone = digits ? `+${digits}` : '';

    const iso2 = String(countryData?.countryCode || '').toUpperCase();

    if (iso2) {
      onCountryChange?.(iso2);
    }

    onChange?.(normalizedPhone);
  };

  const valid = value ? isReasonablePhone(value) : false;

  return (
    <div className="relative z-[60] overflow-visible">
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}{required ? ' *' : ''}
        </label>
      )}

      <div
        className={`relative z-[60] phone-input-wrapper ${
          error ? 'phone-input-has-error' : ''
        }`}
      >
        <PhoneInput
          country={selectedCountry}
          value={value}
          onChange={handleChange}
          disabled={disabled}

          /* COMPLETE WORLDWIDE LIST */
          enableSearch={true}
          disableSearchIcon={false}
          enableAreaCodes={false}
          enableTerritories={true}
          autoFormat={true}

          /*
           * Do not use only preferredCountries as the country list.
           * These are simply displayed at the top; ALL countries remain
           * available below them.
           */
          preferredCountries={[
            'pk',
            'us',
            'gb',
            'ae',
            'sa',
            'ca',
            'au',
            'in',
          ]}

          countryCodeEditable={false}

          inputProps={{
            name: 'phone',
            type: 'tel',
            required,
            autoComplete: 'tel',
            inputMode: 'tel',
            'aria-label': 'Contact number',
            'aria-invalid': Boolean(error) || Boolean(value && !valid),
          }}

          placeholder={
            selectedCountry === 'pk'
              ? '300 1234567'
              : 'Phone number'
          }

          containerClass="phone-input-container"
          inputClass="phone-input-field"
          buttonClass="phone-input-button"
          dropdownClass="phone-input-dropdown"
        />
      </div>

      <div className="mt-1.5 min-h-[18px]">
        {error ? (
          <p className="text-xs font-semibold text-red-600">{error}</p>
        ) : value && !valid ? (
          <p className="text-xs font-medium text-red-600">
            Enter a valid phone number.
          </p>
        ) : value && valid ? (
          <p className="text-[11px] font-medium text-emerald-600">
            Valid phone format.
          </p>
        ) : (
          <p className="text-[11px] text-slate-400">
            Select any country and enter its phone number.
          </p>
        )}
      </div>

      <style>{`
        /*
         * Keep the dropdown above the registration card and make sure
         * neither the input wrapper nor the dropdown clips the country list.
         */
        .phone-input-wrapper,
        .phone-input-wrapper .react-tel-input,
        .phone-input-container {
          width: 100% !important;
          position: relative !important;
          z-index: 60 !important;
          overflow: visible !important;
        }

        .phone-input-container {
          min-height: 52px;
        }

        .phone-input-field {
          width: 100% !important;
          height: 52px !important;
          min-height: 52px !important;
          border-radius: 16px !important;
          border: 1px solid #e2e8f0 !important;
          background: rgba(248, 250, 252, 0.65) !important;
          color: #1e293b !important;
          font-size: 15px !important;
          padding-left: 62px !important;
          padding-right: 12px !important;
          outline: none !important;
        }

        .phone-input-field:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.10) !important;
          background: #ffffff !important;
        }

        .phone-input-button {
          width: 54px !important;
          height: 52px !important;
          border-radius: 16px 0 0 16px !important;
          border: 1px solid #e2e8f0 !important;
          background: rgba(248, 250, 252, 0.65) !important;
          z-index: 70 !important;
        }

        .phone-input-button:hover,
        .phone-input-button.open {
          background: #ffffff !important;
        }

        /*
         * THIS is the important dropdown fix.
         * The country list is explicitly visible and has its own
         * scrolling area. Search and ALL countries stay inside it.
         */
        .phone-input-dropdown {
          position: absolute !important;
          top: 54px !important;
          left: 0 !important;
          width: 340px !important;
          max-width: calc(100vw - 32px) !important;
          max-height: 360px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 99999 !important;
          margin: 4px 0 0 !important;
          padding: 0 !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 14px !important;
          background: #ffffff !important;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18) !important;
        }

        .phone-input-dropdown .search {
          position: sticky !important;
          top: 0 !important;
          z-index: 2 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 10px !important;
          background: #ffffff !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .phone-input-dropdown .search-box {
          width: 100% !important;
          height: 40px !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 10px !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 9px !important;
          outline: none !important;
          color: #1e293b !important;
          background: #ffffff !important;
        }

        .phone-input-dropdown .search-box:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.10) !important;
        }

        /*
         * Force every country row to be visible.
         * This also fixes cases where Tailwind/global CSS accidentally
         * hides .country elements.
         */
        .phone-input-dropdown .country {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          min-height: 42px !important;
          box-sizing: border-box !important;
          padding: 8px 12px !important;
          margin: 0 !important;
          color: #1e293b !important;
          background: #ffffff !important;
          cursor: pointer !important;
        }

        .phone-input-dropdown .country:hover,
        .phone-input-dropdown .country.highlight {
          background: #ecfdf5 !important;
        }

        .phone-input-dropdown .country .flag {
          flex: 0 0 auto !important;
          margin-right: 9px !important;
        }

        .phone-input-dropdown .country .country-name {
          color: #1e293b !important;
          font-size: 13px !important;
          line-height: 1.25 !important;
        }

        .phone-input-dropdown .country .dial-code {
          color: #64748b !important;
          margin-left: auto !important;
          padding-left: 8px !important;
          font-size: 12px !important;
        }

        .phone-input-has-error .phone-input-field {
          border-color: #f87171 !important;
          box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.10) !important;
        }

        @media (max-width: 640px) {
          .phone-input-dropdown {
            width: min(340px, calc(100vw - 32px)) !important;
          }
        }
      `}</style>
    </div>
  );
}
