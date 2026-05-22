import { useState } from 'react';
import styled from 'styled-components';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Pista8Theme } from '@/config/theme';
import WhitelistManager from './WhitelistManager';
import FacultiesManager from './FacultiesManager';

type ConfigTab = 'dominios' | 'facultades';

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 900;
  color: #1f2628;
  letter-spacing: -0.03em;
`;

const PageSubtitle = styled.p`
  margin: 8px 0 0;
  color: #66727a;
  font-size: 14px;
  line-height: 1.5;
  max-width: 72ch;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigCard = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  text-align: left;
  padding: 18px 18px 16px;
  border-radius: 18px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
  border: 1.5px solid
    ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.45)' : 'rgba(72, 80, 84, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.06)' : '#fff')};
  box-shadow: ${({ $active }) =>
    $active ? '0 10px 24px rgba(254, 65, 10, 0.12)' : '0 2px 8px rgba(72, 80, 84, 0.04)'};

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active }) =>
      $active ? 'rgba(254, 65, 10, 0.55)' : 'rgba(72, 80, 84, 0.2)'};
    background: ${({ $active }) =>
      $active ? 'rgba(254, 65, 10, 0.08)' : 'rgba(72, 80, 84, 0.03)'};
  }
`;

const CardIcon = styled.span<{ $active: boolean }>`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.12)' : 'rgba(72, 80, 84, 0.06)')};
  color: ${({ $active }) => ($active ? Pista8Theme.primary : '#9aa3ab')};
  font-size: 20px;
`;

const CardCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const CardTitle = styled.span`
  font-size: 16px;
  font-weight: 900;
  color: #1f2628;
`;

const CardHint = styled.span`
  font-size: 12px;
  color: #76828a;
  line-height: 1.45;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(72, 80, 84, 0.1);
  margin: 0;
`;

const ContentZone = styled.div`
  min-width: 0;
`;

export default function AccessConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('dominios');

  return (
    <Page>
      <header>
        <PageTitle>Configuración de Accesos y Registros</PageTitle>
        <PageSubtitle>
          Administra los dominios de correo permitidos y el catálogo de facultades que alimentan los formularios de la plataforma.
        </PageSubtitle>
      </header>

      <CardsGrid>
        <ConfigCard
          type="button"
          $active={activeTab === 'dominios'}
          onClick={() => setActiveTab('dominios')}
          aria-pressed={activeTab === 'dominios'}
        >
          <CardIcon $active={activeTab === 'dominios'} aria-hidden>
            <i className="fa-solid fa-at" />
          </CardIcon>
          <CardCopy>
            <CardTitle>Dominios autorizados</CardTitle>
            <CardHint>Whitelist de terminaciones de correo (@univalle.edu, etc.)</CardHint>
          </CardCopy>
        </ConfigCard>

        <ConfigCard
          type="button"
          $active={activeTab === 'facultades'}
          onClick={() => setActiveTab('facultades')}
          aria-pressed={activeTab === 'facultades'}
        >
          <CardIcon $active={activeTab === 'facultades'} aria-hidden>
            <i className="fa-solid fa-building-columns" />
          </CardIcon>
          <CardCopy>
            <CardTitle>Facultades</CardTitle>
            <CardHint>Catálogo paramétrico para registros, retos y filtros</CardHint>
          </CardCopy>
        </ConfigCard>
      </CardsGrid>

      <Divider />

      <ContentZone>
        {activeTab === 'dominios' ? (
          <WhitelistManager key="dominios-panel" />
        ) : (
          <FacultiesManager key="facultades-panel" />
        )}
      </ContentZone>
    </Page>
  );
}
