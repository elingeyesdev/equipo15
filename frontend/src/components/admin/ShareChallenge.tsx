import { useState } from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';

interface ShareProps {
  token: string;
}

const ShareChallenge = ({ token }: ShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/reto/privado/${token}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Error
    }
  };

  return (
    <ShareWrapper>
      <input type="text" readOnly value={shareUrl} className="url-input" />
      <button onClick={copyToClipboard} className="btn-copy">
        {copied ? '¡COPIADO!' : 'COPIAR LINK'}
      </button>
    </ShareWrapper>
  );
};

const ShareWrapper = styled.div`
  display: flex;
  gap: 12px;
  background: ${Pista8Theme.background};
  padding: 14px;
  border-radius: 16px;
  border: 1px dashed ${Pista8Theme.primary};

  .url-input {
    flex: 1;
    border: none;
    background: transparent;
    color: ${Pista8Theme.secondary};
    font-size: 13px;
    font-family: monospace;
    outline: none;
  }

  .btn-copy {
    background: ${Pista8Theme.primary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.1s;
    &:active { transform: scale(0.96); }
  }
`;

export default ShareChallenge;
