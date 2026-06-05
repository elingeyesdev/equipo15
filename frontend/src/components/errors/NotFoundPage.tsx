import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';

const staticShift = keyframes`
  100% {
    background-position:
      50% 0,
      60% 50%;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <StyledWrapper>
      <div className="stage">
        <div className="main_wrapper">
          <div className="main">
            <div className="antenna">
              <div className="antenna_shadow" />
              <div className="a1" />
              <div className="a1d" />
              <div className="a2" />
              <div className="a2d" />
              <div className="a_base" />
            </div>
            <div className="tv">
              <div className="cruve">
                <svg
                  className="curve_svg"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 189.929 189.929"
                  xmlSpace="preserve"
                >
                  <path d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
          C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z" />
                </svg>
              </div>
              <div className="display_div">
                <div className="screen_out">
                  <div className="screen_out1">
                    <div className="screen">
                      <span className="notfound_text">NOT FOUND</span>
                    </div>
                    <div className="screenM">
                      <span className="notfound_text">NOT FOUND</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lines">
                <div className="line1" />
                <div className="line2" />
                <div className="line3" />
              </div>
              <div className="buttons_div">
                <div className="b1"><div /></div>
                <div className="b2" />
                <div className="speakers">
                  <div className="g1">
                    <div className="g11" />
                    <div className="g12" />
                    <div className="g13" />
                  </div>
                  <div className="g" />
                  <div className="g" />
                </div>
              </div>
            </div>
            <div className="bottom">
              <div className="base1" />
              <div className="base2" />
              <div className="base3" />
            </div>
          </div>
          <div className="text_404">
            <div className="text_4041">4</div>
            <div className="text_4042">0</div>
            <div className="text_4043">4</div>
          </div>
        </div>
        <div className="cta">
          <h1>Pagina no encontrada</h1>
          <p>El enlace que seguiste no existe o fue movido.</p>
          <button type="button" className="btn-home" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  --p8-primary: ${Pista8Theme.primary};
  --p8-secondary: ${Pista8Theme.secondary};
  --p8-background: ${Pista8Theme.background};
  --p8-white: ${Pista8Theme.white};
  --p8-shadow: ${Pista8Theme.shadow};
  --p8-warning: ${Pista8Theme.warning};
  --p8-primary-rgb: 254, 65, 10;
  --p8-secondary-rgb: 72, 80, 84;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  border-radius: 28px;
  background:
    radial-gradient(900px 500px at 10% 10%, rgba(var(--p8-primary-rgb), 0.18), transparent 60%),
    radial-gradient(900px 500px at 90% 0%, rgba(var(--p8-secondary-rgb), 0.18), transparent 60%),
    linear-gradient(180deg, var(--p8-white) 0%, var(--p8-background) 55%);
  mask-image: radial-gradient(140% 140% at 50% 40%, #000 0 70%, transparent 100%);
  -webkit-mask-image: radial-gradient(140% 140% at 50% 40%, #000 0 70%, transparent 100%);
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  color: var(--p8-secondary);
  font-family: 'Montserrat', 'Trebuchet MS', sans-serif;

  .stage {
    width: min(920px, 96vw);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }

  .cta {
    text-align: center;
    max-width: 520px;
    padding: 0 12px;
  }

  .cta h1 {
    font-size: clamp(26px, 4vw, 36px);
    margin: 0 0 8px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .cta p {
    margin: 0 0 18px;
    font-size: 14px;
    color: rgba(var(--p8-secondary-rgb), 0.8);
  }

  .btn-home {
    background: var(--p8-secondary);
    color: var(--p8-white);
    border: none;
    padding: 14px 28px;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 700;
    letter-spacing: 0.03em;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 12px 24px rgba(var(--p8-secondary-rgb), 0.18);
  }

  .btn-home:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 30px rgba(var(--p8-secondary-rgb), 0.24);
  }

  .main_wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30em;
    height: 30em;
    isolation: isolate;
    mask-image: radial-gradient(120% 120% at 50% 50%, #000 0 72%, transparent 100%);
    -webkit-mask-image: radial-gradient(120% 120% at 50% 50%, #000 0 72%, transparent 100%);
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
  }

  .main {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 5em;
    animation: ${float} 6s ease-in-out infinite;
  }

  .antenna {
    width: 5em;
    height: 5em;
    border-radius: 50%;
    border: 2px solid var(--p8-secondary);
    background-color: var(--p8-primary);
    margin-bottom: -6em;
    margin-left: 0em;
    z-index: -1;
  }
  .antenna_shadow {
    position: absolute;
    background-color: transparent;
    width: 50px;
    height: 56px;
    margin-left: 1.68em;
    border-radius: 45%;
    transform: rotate(140deg);
    border: 4px solid transparent;
    box-shadow:
      inset 0px 16px rgba(var(--p8-primary-rgb), 0.65),
      inset 0px 16px 1px 1px rgba(var(--p8-primary-rgb), 0.65);
  }
  .antenna::after {
    content: "";
    position: absolute;
    margin-top: -9.4em;
    margin-left: 0.4em;
    transform: rotate(-25deg);
    width: 1em;
    height: 0.5em;
    border-radius: 50%;
    background-color: rgba(var(--p8-primary-rgb), 0.45);
  }
  .antenna::before {
    content: "";
    position: absolute;
    margin-top: 0.2em;
    margin-left: 1.25em;
    transform: rotate(-20deg);
    width: 1.5em;
    height: 0.8em;
    border-radius: 50%;
    background-color: rgba(var(--p8-primary-rgb), 0.45);
  }
  .a1 {
    position: relative;
    top: -102%;
    left: -130%;
    width: 12em;
    height: 5.5em;
    border-radius: 50px;
    background-image: linear-gradient(
      rgba(var(--p8-secondary-rgb), 0.95),
      rgba(var(--p8-secondary-rgb), 0.95),
      rgba(var(--p8-secondary-rgb), 0.6),
      rgba(var(--p8-secondary-rgb), 0.6),
      rgba(var(--p8-secondary-rgb), 0.95)
    );
    transform: rotate(-29deg);
    clip-path: polygon(50% 0%, 49% 100%, 52% 100%);
  }
  .a1d {
    position: relative;
    top: -211%;
    left: -35%;
    transform: rotate(45deg);
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    border: 2px solid var(--p8-secondary);
    background-color: rgba(var(--p8-secondary-rgb), 0.6);
    z-index: 99;
  }
  .a2 {
    position: relative;
    top: -210%;
    left: -10%;
    width: 12em;
    height: 4em;
    border-radius: 50px;
    background-image: linear-gradient(
      rgba(var(--p8-secondary-rgb), 0.95),
      rgba(var(--p8-secondary-rgb), 0.95),
      rgba(var(--p8-secondary-rgb), 0.6),
      rgba(var(--p8-secondary-rgb), 0.6),
      rgba(var(--p8-secondary-rgb), 0.95)
    );
    margin-right: 5em;
    clip-path: polygon(
      47% 0,
      47% 0,
      34% 34%,
      54% 25%,
      32% 100%,
      29% 96%,
      49% 32%,
      30% 38%
    );
    transform: rotate(-8deg);
  }
  .a2d {
    position: relative;
    top: -294%;
    left: 94%;
    width: 0.5em;
    height: 0.5em;
    border-radius: 50%;
    border: 2px solid var(--p8-secondary);
    background-color: rgba(var(--p8-secondary-rgb), 0.6);
    z-index: 99;
  }

  .notfound_text {
    background-color: var(--p8-secondary);
    padding-left: 0.3em;
    padding-right: 0.3em;
    font-size: 0.75em;
    color: var(--p8-white);
    letter-spacing: 0.2em;
    border-radius: 5px;
    z-index: 10;
  }
  .tv {
    width: 17em;
    height: 9em;
    margin-top: 3em;
    border-radius: 15px;
    background-color: var(--p8-primary);
    display: flex;
    justify-content: center;
    border: 2px solid var(--p8-secondary);
    box-shadow: inset 0.2em 0.2em rgba(var(--p8-primary-rgb), 0.5);
  }
  .tv::after {
    content: "";
    position: absolute;
    width: 17em;
    height: 9em;
    border-radius: 15px;
    background:
      repeating-radial-gradient(var(--p8-primary) 0 0.0001%, rgba(var(--p8-secondary-rgb), 0.25) 0 0.0002%) 50% 0/2500px
        2500px,
      repeating-conic-gradient(var(--p8-primary) 0 0.0001%, rgba(var(--p8-secondary-rgb), 0.25) 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    opacity: 0.09;
  }
  .curve_svg {
    position: absolute;
    margin-top: 0.25em;
    margin-left: -0.25em;
    height: 12px;
    width: 12px;
    fill: var(--p8-secondary);
  }
  .display_div {
    display: flex;
    align-items: center;
    align-self: center;
    justify-content: center;
    border-radius: 15px;
    box-shadow: 3.5px 3.5px 0px rgba(var(--p8-primary-rgb), 0.5);
  }
  .screen_out {
    width: auto;
    height: auto;
    border-radius: 10px;
  }
  .screen_out1 {
    width: 11em;
    height: 7.75em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }
  .screen {
    width: 13em;
    height: 7.85em;
    border: 2px solid var(--p8-secondary);
    background:
      repeating-radial-gradient(var(--p8-secondary) 0 0.0001%, var(--p8-white) 0 0.0002%) 50% 0/2500px
        2500px,
      repeating-conic-gradient(var(--p8-secondary) 0 0.0001%, var(--p8-white) 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    animation: ${staticShift} 0.2s infinite alternate;
    border-radius: 10px;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: var(--p8-secondary);
    letter-spacing: 0.15em;
    text-align: center;
  }

  .screenM {
    width: 13em;
    height: 7.85em;
    position: relative;
    background: linear-gradient(
      to right,
      var(--p8-secondary) 0%,
      var(--p8-secondary) 14.2857142857%,
      var(--p8-white) 14.2857142857%,
      var(--p8-white) 28.5714285714%,
      var(--p8-warning) 28.5714285714%,
      var(--p8-warning) 42.8571428571%,
      var(--p8-primary) 42.8571428571%,
      var(--p8-primary) 57.1428571429%,
      rgba(var(--p8-secondary-rgb), 0.65) 57.1428571429%,
      rgba(var(--p8-secondary-rgb), 0.65) 71.4285714286%,
      var(--p8-white) 71.4285714286%,
      var(--p8-white) 85.7142857143%,
      var(--p8-primary) 85.7142857143%,
      var(--p8-primary) 100%
    );
    border-radius: 10px;
    border: 2px solid var(--p8-secondary);
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: var(--p8-secondary);
    letter-spacing: 0.15em;
    text-align: center;
    overflow: hidden;
  }
  .screenM:before,
  .screenM:after {
    content: "";
    position: absolute;
    left: 0;
    z-index: 1;
    width: 100%;
  }
  .screenM:before {
    top: 0;
    height: 68.4782608696%;
    background: linear-gradient(
      to right,
      var(--p8-white) 0%,
      var(--p8-white) 14.2857142857%,
      var(--p8-warning) 14.2857142857%,
      var(--p8-warning) 28.5714285714%,
      rgba(var(--p8-primary-rgb), 0.85) 28.5714285714%,
      rgba(var(--p8-primary-rgb), 0.85) 42.8571428571%,
      rgba(var(--p8-secondary-rgb), 0.5) 42.8571428571%,
      rgba(var(--p8-secondary-rgb), 0.5) 57.1428571429%,
      var(--p8-primary) 57.1428571429%,
      var(--p8-primary) 71.4285714286%,
      rgba(var(--p8-secondary-rgb), 0.8) 71.4285714286%,
      rgba(var(--p8-secondary-rgb), 0.8) 85.7142857143%,
      var(--p8-secondary) 85.7142857143%,
      var(--p8-secondary) 100%
    );
  }
  .screenM:after {
    bottom: 0;
    height: 21.7391304348%;
    background: linear-gradient(
      to right,
      rgba(var(--p8-secondary-rgb), 0.8) 0%,
      rgba(var(--p8-secondary-rgb), 0.8) 16.6666666667%,
      var(--p8-white) 16.6666666667%,
      var(--p8-white) 33.3333333333%,
      var(--p8-primary) 33.3333333333%,
      var(--p8-primary) 50%,
      rgba(var(--p8-secondary-rgb), 0.65) 50%,
      rgba(var(--p8-secondary-rgb), 0.65) 66.6666666667%,
      rgba(var(--p8-secondary-rgb), 0.4) 66.6666666667%,
      rgba(var(--p8-secondary-rgb), 0.4) 83.3333333333%,
      var(--p8-secondary) 83.3333333333%,
      var(--p8-secondary) 100%
    );
  }

  .lines {
    display: flex;
    column-gap: 0.1em;
    align-self: flex-end;
  }
  .line1,
  .line3 {
    width: 2px;
    height: 0.5em;
    background-color: var(--p8-secondary);
    border-radius: 25px 25px 0px 0px;
    margin-top: 0.5em;
  }
  .line2 {
    flex-grow: 1;
    width: 2px;
    height: 1em;
    background-color: var(--p8-secondary);
    border-radius: 25px 25px 0px 0px;
  }

  .buttons_div {
    width: 4.25em;
    align-self: center;
    height: 8em;
    background-color: rgba(var(--p8-primary-rgb), 0.6);
    border: 2px solid var(--p8-secondary);
    padding: 0.6em;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    row-gap: 0.75em;
    box-shadow: 3px 3px 0px rgba(var(--p8-primary-rgb), 0.5);
  }
  .b1 {
    width: 1.65em;
    height: 1.65em;
    border-radius: 50%;
    background-color: rgba(var(--p8-secondary-rgb), 0.7);
    border: 2px solid var(--p8-secondary);
    box-shadow:
      inset 2px 2px 1px rgba(var(--p8-secondary-rgb), 0.2),
      -2px 0px rgba(var(--p8-secondary-rgb), 0.8),
      -2px 0px 0px 1px var(--p8-secondary);
  }
  .b1::before {
    content: "";
    position: absolute;
    margin-top: 1em;
    margin-left: 0.5em;
    transform: rotate(47deg);
    border-radius: 5px;
    width: 0.1em;
    height: 0.4em;
    background-color: var(--p8-secondary);
  }
  .b1::after {
    content: "";
    position: absolute;
    margin-top: 0.9em;
    margin-left: 0.8em;
    transform: rotate(47deg);
    border-radius: 5px;
    width: 0.1em;
    height: 0.55em;
    background-color: var(--p8-secondary);
  }
  .b1 div {
    content: "";
    position: absolute;
    margin-top: -0.1em;
    margin-left: 0.65em;
    transform: rotate(45deg);
    width: 0.15em;
    height: 1.5em;
    background-color: var(--p8-secondary);
  }
  .b2 {
    width: 1.65em;
    height: 1.65em;
    border-radius: 50%;
    background-color: rgba(var(--p8-secondary-rgb), 0.7);
    border: 2px solid var(--p8-secondary);
    box-shadow:
      inset 2px 2px 1px rgba(var(--p8-secondary-rgb), 0.2),
      -2px 0px rgba(var(--p8-secondary-rgb), 0.8),
      -2px 0px 0px 1px var(--p8-secondary);
  }
  .b2::before {
    content: "";
    position: absolute;
    margin-top: 1.05em;
    margin-left: 0.8em;
    transform: rotate(-45deg);
    border-radius: 5px;
    width: 0.15em;
    height: 0.4em;
    background-color: var(--p8-secondary);
  }
  .b2::after {
    content: "";
    position: absolute;
    margin-top: -0.1em;
    margin-left: 0.65em;
    transform: rotate(-45deg);
    width: 0.15em;
    height: 1.5em;
    background-color: var(--p8-secondary);
  }
  .speakers {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
  }
  .speakers .g1 {
    display: flex;
    column-gap: 0.25em;
  }
  .speakers .g1 .g11,
  .g12,
  .g13 {
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    background-color: rgba(var(--p8-secondary-rgb), 0.7);
    border: 2px solid var(--p8-secondary);
    box-shadow: inset 1.25px 1.25px 1px rgba(var(--p8-secondary-rgb), 0.2);
  }
  .speakers .g {
    width: auto;
    height: 2px;
    background-color: var(--p8-secondary);
  }

  .bottom {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 8.7em;
  }
  .base1 {
    height: 1em;
    width: 2em;
    border: 2px solid var(--p8-secondary);
    background-color: rgba(var(--p8-secondary-rgb), 0.7);
    margin-top: -0.15em;
    z-index: -1;
  }
  .base2 {
    height: 1em;
    width: 2em;
    border: 2px solid var(--p8-secondary);
    background-color: rgba(var(--p8-secondary-rgb), 0.7);
    margin-top: -0.15em;
    z-index: -1;
  }
  .base3 {
    position: absolute;
    height: 0.15em;
    width: 17.5em;
    background-color: var(--p8-secondary);
    margin-top: 0.8em;
  }

  .text_404 {
    position: absolute;
    display: flex;
    flex-direction: row;
    column-gap: 6em;
    z-index: 0;
    margin-bottom: 2em;
    align-items: center;
    justify-content: center;
    opacity: 1;
    font-family: 'Montserrat', 'Trebuchet MS', sans-serif;
    color: rgba(var(--p8-secondary-rgb), 0.22);
    text-shadow: 0 18px 40px rgba(var(--p8-secondary-rgb), 0.12);
    pointer-events: none;
  }
  .text_4041 {
    transform: scaleY(24.5) scaleX(9);
  }
  .text_4042 {
    transform: scaleY(24.5) scaleX(9);
  }
  .text_4043 {
    transform: scaleY(24.5) scaleX(9);
  }

  @media only screen and (max-width: 495px) {
    .text_404 {
      column-gap: 6em;
    }
  }
  @media only screen and (max-width: 395px) {
    .text_404 {
      column-gap: 4em;
    }
    .text_4041 {
      transform: scaleY(25) scaleX(8);
    }
    .text_4042 {
      transform: scaleY(25) scaleX(8);
    }
    .text_4043 {
      transform: scaleY(25) scaleX(8);
    }
  }

  @media (max-width: 275px), (max-height: 520px) {
    .main {
      position: relative;
    }
  }

  @media only screen and (max-width: 1024px) {
    .screenM {
      display: flex;
    }
    .screen {
      display: none;
    }
  }
  @media only screen and (min-width: 1025px) {
    .screen {
      display: flex;
    }
    .screenM {
      display: none;
    }
  }
`;

export default NotFoundPage;
