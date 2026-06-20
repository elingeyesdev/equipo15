import React from 'react';
import styled from 'styled-components';

interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = (props) => {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" {...props} />
        <div className="checkmark">
          <svg viewBox="0 0 24 24" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.2))">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    --size: 1.5rem;
    --active-color: #FE410A; /* Using Pista8Theme primary color */
    --idle-color: #e2e8f0;
    display: block;
    position: relative;
    width: var(--size);
    height: var(--size);
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s ease;
  }

  /* Make sure it respects disabled state */
  .container:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .container:not(:has(input:disabled)):hover {
    transform: scale(1.1);
  }

  .container input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: white;
    border: 2px solid var(--idle-color);
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container input:checked ~ .checkmark {
    background-color: var(--active-color);
    border-color: var(--active-color);
    box-shadow: 0 4px 15px rgba(254, 65, 10, 0.4);
  }

  .container input:focus-visible ~ .checkmark {
    outline: 3px solid #fca5a5;
    outline-offset: 4px;
  }

  .checkmark svg {
    width: 65%;
    height: 65%;
    fill: none;
    stroke: white;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    transition: all 0.3s ease;
    transition-delay: 0.1s;
  }

  .container input:checked ~ .checkmark svg {
    stroke-dashoffset: 0;
  }

  @keyframes bounce {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }

  .container input:not(:disabled):active ~ .checkmark {
    transform: scale(0.85);
  }
`;

export default AnimatedCheckbox;
