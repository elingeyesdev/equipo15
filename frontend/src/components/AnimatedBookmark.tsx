import React from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../config/theme';

interface AnimatedBookmarkProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const AnimatedBookmark: React.FC<AnimatedBookmarkProps> = (props) => {
  return (
    <StyledWrapper $checked={props.checked} $disabled={props.disabled}>
      <label className="ui-bookmark" onClick={e => e.stopPropagation()}>
        <input type="checkbox" {...props} />
        <div className="bookmark">
          <svg viewBox="0 0 32 32">
            <g>
              <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z" />
            </g>
          </svg>
        </div>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $checked?: boolean; $disabled?: boolean }>`
  .ui-bookmark {
    /* Pill button styles to match harmony */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => (p.$checked ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
    border: 1.5px solid ${(p) => (p.$checked ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
    border-radius: 99px;
    padding: 10px 20px;
    cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
    box-shadow: ${(p) => (p.$checked ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none')};
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
    opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
    filter: ${(p) => (p.$disabled ? 'grayscale(1)' : 'none')};

    /* Animation variables */
    --icon-size: 16px;
    --icon-secondary-color: #94a3b8;
    --icon-hover-color: #FE410A;
    --icon-primary-color: #FE410A;
    --icon-circle-border: 1.5px solid var(--icon-primary-color);
    --icon-circle-size: 26px;
    --icon-anmt-duration: 0.35s;
  }

  .ui-bookmark:hover {
    background: ${(p) => (!p.$checked ? `${Pista8Theme.primary}08` : `${Pista8Theme.primary}16`)};
    border-color: ${(p) => (!p.$checked ? `${Pista8Theme.primary}40` : `${Pista8Theme.primary}66`)};
  }
  .ui-bookmark input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: none;
  }

  .ui-bookmark .bookmark {
    width: var(--icon-size);
    height: auto;
    fill: var(--icon-secondary-color);
    cursor: pointer;
    -webkit-transition: 0.2s;
    -o-transition: 0.2s;
    transition: 0.2s;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    position: relative;
    -webkit-transform-origin: top;
    -ms-transform-origin: top;
    transform-origin: top;
  }

  .bookmark::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    -webkit-box-shadow: 0 30px 0 -4px var(--icon-primary-color),
      30px 0 0 -4px var(--icon-primary-color),
      0 -30px 0 -4px var(--icon-primary-color),
      -30px 0 0 -4px var(--icon-primary-color),
      -22px 22px 0 -4px var(--icon-primary-color),
      -22px -22px 0 -4px var(--icon-primary-color),
      22px -22px 0 -4px var(--icon-primary-color),
      22px 22px 0 -4px var(--icon-primary-color);
    box-shadow: 0 30px 0 -4px var(--icon-primary-color),
      30px 0 0 -4px var(--icon-primary-color),
      0 -30px 0 -4px var(--icon-primary-color),
      -30px 0 0 -4px var(--icon-primary-color),
      -22px 22px 0 -4px var(--icon-primary-color),
      -22px -22px 0 -4px var(--icon-primary-color),
      22px -22px 0 -4px var(--icon-primary-color),
      22px 22px 0 -4px var(--icon-primary-color);
    border-radius: 50%;
    -webkit-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0);
  }

  .bookmark::before {
    content: "";
    position: absolute;
    border-radius: 50%;
    border: var(--icon-circle-border);
    opacity: 0;
  }

  /* actions */

  .ui-bookmark:hover .bookmark {
    fill: var(--icon-hover-color);
  }

  .ui-bookmark input:checked + .bookmark::after {
    -webkit-animation: circles var(--icon-anmt-duration)
      cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation: circles var(--icon-anmt-duration)
      cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    -webkit-animation-delay: var(--icon-anmt-duration);
    animation-delay: var(--icon-anmt-duration);
  }

  .ui-bookmark input:checked + .bookmark {
    fill: var(--icon-primary-color);
    -webkit-animation: bookmark var(--icon-anmt-duration) forwards;
    animation: bookmark var(--icon-anmt-duration) forwards;
    -webkit-transition-delay: 0.3s;
    -o-transition-delay: 0.3s;
    transition-delay: 0.3s;
  }

  .ui-bookmark input:checked + .bookmark::before {
    -webkit-animation: circle var(--icon-anmt-duration)
      cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation: circle var(--icon-anmt-duration)
      cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    -webkit-animation-delay: var(--icon-anmt-duration);
    animation-delay: var(--icon-anmt-duration);
  }

  @-webkit-keyframes bookmark {
    50% {
      -webkit-transform: scaleY(0.6);
      transform: scaleY(0.6);
    }

    100% {
      -webkit-transform: scaleY(1);
      transform: scaleY(1);
    }
  }

  @keyframes bookmark {
    50% {
      -webkit-transform: scaleY(0.6);
      transform: scaleY(0.6);
    }

    100% {
      -webkit-transform: scaleY(1);
      transform: scaleY(1);
    }
  }

  @-webkit-keyframes circle {
    from {
      width: 0;
      height: 0;
      opacity: 0;
    }

    90% {
      width: var(--icon-circle-size);
      height: var(--icon-circle-size);
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes circle {
    from {
      width: 0;
      height: 0;
      opacity: 0;
    }

    90% {
      width: var(--icon-circle-size);
      height: var(--icon-circle-size);
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @-webkit-keyframes circles {
    from {
      -webkit-transform: scale(0);
      transform: scale(0);
    }

    40% {
      opacity: 1;
    }

    to {
      -webkit-transform: scale(0.8);
      transform: scale(0.8);
      opacity: 0;
    }
  }

  @keyframes circles {
    from {
      -webkit-transform: scale(0);
      transform: scale(0);
    }

    40% {
      opacity: 1;
    }

    to {
      -webkit-transform: scale(0.8);
      transform: scale(0.8);
      opacity: 0;
    }
  }
`;

export default AnimatedBookmark;
