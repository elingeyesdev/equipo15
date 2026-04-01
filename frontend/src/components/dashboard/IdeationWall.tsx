import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';

const mockChallenges = [
  { id: 1, title: 'Reto de Ingeniería UNIVALLE 2026', category: 'Ingeniería', ideas: 24, likes: 187, badge: 'ACTIVO' },
  { id: 2, title: 'Innovación Sostenible Campus', category: 'Sostenibilidad', ideas: 15, likes: 102, badge: 'NUEVO' },
  { id: 3, title: 'App para Bienestar Estudiantil', category: 'Tecnología', ideas: 31, likes: 243, badge: 'ACTIVO' },
];

const topFacultades = [
  { name: 'Ingeniería', likes: 187 },
  { name: 'Ciencias', likes: 143 },
  { name: 'Humanidades', likes: 98 },
  { name: 'Medicina', likes: 76 },
  { name: 'Derecho', likes: 54 },
];

const topLideres = [
  { name: 'Valentina R.', ideas: 12 },
  { name: 'Mateo G.', ideas: 9 },
  { name: 'Camila P.', ideas: 7 },
  { name: 'Andrés L.', ideas: 6 },
  { name: 'Sofía M.', ideas: 5 },
];

const IdeationWall = () => {
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<any>(mockChallenges[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = ['Todos', 'Ingeniería', 'Tecnología', 'Sostenibilidad'];
  const firstName = user?.displayName?.split(' ')[0] || 'Innovador';

  return (
    <Root>
      <Overlay open={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar open={sidebarOpen}>
        <SidebarTop>
          <SidebarBrand>
            <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="110" height="28">
              <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white" letterSpacing="-2">PIST</text>
              <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
              <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white">8</text>
            </svg>
          </SidebarBrand>
          <SidebarClose onClick={() => setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </SidebarClose>
        </SidebarTop>

        <SidebarNav>
          <SidebarNavItem active>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Ver Retos
          </SidebarNavItem>
          <SidebarNavItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Mis Ideas
          </SidebarNavItem>
        </SidebarNav>

        <SidebarFooter>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>

      <Page>
        <Header>
          <WelcomeZone>
            <Greeting>Hola, <span>{firstName}</span></Greeting>
            <Sub>¿Listo para despegar tu próxima gran idea?</Sub>
          </WelcomeZone>

          <HamburgerBtn onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </HamburgerBtn>
        </Header>

        <Hangar>
          <HangarGrid />
          <HangarLabel>PISTA 8 — HANGAR DE IDEAS</HangarLabel>
          <HangarSub>Próximamente: ideas en tiempo real</HangarSub>
          <HangarGlow />
        </Hangar>

        <MainGrid>
          <LeftPanel>
            <PanelHeader>
              <PanelTitle>Retos activos</PanelTitle>
              <FilterWrap>
                <FilterBtn onClick={() => setFilterOpen(!filterOpen)} active={filterOpen}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                </FilterBtn>
                {filterOpen && (
                  <FilterDropdown>
                    {filters.map(f => (
                      <FilterOption
                        key={f}
                        active={activeFilter === f}
                        onClick={() => { setActiveFilter(f); setFilterOpen(false); }}
                      >
                        {f}
                      </FilterOption>
                    ))}
                  </FilterDropdown>
                )}
              </FilterWrap>
            </PanelHeader>

            <ChallengeList>
              {mockChallenges
                .filter(c => activeFilter === 'Todos' || c.category === activeFilter)
                .map(c => (
                  <ChallengeCard
                    key={c.id}
                    active={selectedChallenge?.id === c.id}
                    onClick={() => setSelectedChallenge(c)}
                  >
                    {selectedChallenge?.id === c.id && <ActiveBar />}
                    <TopRight>
                      {c.badge && <BadgeCorner>{c.badge}</BadgeCorner>}
                      <LikesChip>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        {c.likes}
                      </LikesChip>
                    </TopRight>
                    <CardTop>
                      <CategoryTag>{c.category}</CategoryTag>
                    </CardTop>
                    <CardTitle>{c.title}</CardTitle>
                    <CardMeta>{c.ideas} ideas enviadas</CardMeta>
                  </ChallengeCard>
                ))}
            </ChallengeList>
          </LeftPanel>

          <RightPanel hasChallenge={!!selectedChallenge}>
            {selectedChallenge ? (
              <>
                <StatsHeader>
                  <StatsTitle>Estadísticas</StatsTitle>
                  <StatsSub>{selectedChallenge.title}</StatsSub>
                </StatsHeader>

                <StatsSummary>
                  <SummaryCard>
                    <SummaryVal>{selectedChallenge.ideas}</SummaryVal>
                    <SummaryLabel>Ideas</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryVal>{selectedChallenge.likes}</SummaryVal>
                    <SummaryLabel>Likes</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryVal>{topLideres.length}</SummaryVal>
                    <SummaryLabel>Líderes</SummaryLabel>
                  </SummaryCard>
                </StatsSummary>

                <StatsColumns>
                  <StatsCol>
                    <ColLabel>Top Facultades</ColLabel>
                    {topFacultades.map((f, i) => (
                      <RankRow key={f.name}>
                        <RankNum>{i + 1}</RankNum>
                        <RankName>{f.name}</RankName>
                        <RankBar>
                          <RankFill pct={Math.round((f.likes / topFacultades[0].likes) * 100)} delay={i * 80} />
                        </RankBar>
                        <RankVal>{f.likes}</RankVal>
                      </RankRow>
                    ))}
                  </StatsCol>

                  <StatsDivider />

                  <StatsCol>
                    <ColLabel>Top Líderes</ColLabel>
                    {topLideres.map((l, i) => (
                      <RankRow key={l.name}>
                        <RankNum>{i + 1}</RankNum>
                        <RankName>{l.name}</RankName>
                        <RankBar>
                          <RankFill pct={Math.round((l.ideas / topLideres[0].ideas) * 100)} delay={i * 80} />
                        </RankBar>
                        <RankVal>{l.ideas}</RankVal>
                      </RankRow>
                    ))}
                  </StatsCol>
                </StatsColumns>
              </>
            ) : (
              <EmptyStats>
                <EmptyIcon>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </EmptyIcon>
                <p>Seleccioná un reto para ver sus estadísticas</p>
              </EmptyStats>
            )}
          </RightPanel>
        </MainGrid>
      </Page>
    </Root>
  );
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

const fillBar = keyframes`
  from { width: 0%; }
  to   { width: 100%; }
`;

const Root = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  position: relative;
  overflow-x: hidden;
`;

const Overlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(72, 80, 84, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: ${p => p.open ? 1 : 0};
  pointer-events: ${p => p.open ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const Sidebar = styled.aside<{ open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background: ${Pista8Theme.secondary};
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 36px 28px 40px;
  animation: ${p => p.open ? css`${slideIn} 0.32s cubic-bezier(.22,.68,0,1.1) both` : css`${slideOut} 0.28s ease both`};
  ${p => !p.open && 'pointer-events: none;'}
`;

const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 52px;
`;

const SidebarBrand = styled.div``;

const SidebarClose = styled.button`
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.6);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,255,255,0.14); color: white; }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SidebarNavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  background: ${p => p.active ? 'rgba(254,65,10,0.18)' : 'transparent'};
  color: ${p => p.active ? '#FE410A' : 'rgba(255,255,255,0.55)'};
  letter-spacing: 0.01em;
  svg { width: 20px; height: 20px; flex-shrink: 0; }
  &:hover { background: rgba(255,255,255,0.07); color: white; }
`;

const SidebarFooter = styled.div`
  padding-top: 28px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: center;
`;

const Page = styled.div`
  padding: 2.5rem 4%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`;

const WelcomeZone = styled.div``;

const Greeting = styled.h1`
  font-size: 36px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
  span { color: ${Pista8Theme.primary}; }
`;

const Sub = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 6px 0 0;
  font-weight: 500;
`;

const HamburgerBtn = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, transform 0.12s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; transform: scale(1.04); }
  &:active { transform: scale(0.96); }
`;

const Hangar = styled.section`
  position: relative;
  width: 100%;
  height: 180px;
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 24px;
  margin-bottom: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: ${fadeUp} 0.4s 0.05s ease both;
`;

const HangarGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const HangarLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  margin: 0;
  position: relative;
`;

const HangarSub = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.18);
  margin: 0;
  position: relative;
`;

const HangarGlow = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(254,65,10,0.2) 0%, transparent 70%);
  pointer-events: none;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  animation: ${fadeUp} 0.4s 0.1s ease both;
`;

const LeftPanel = styled.div`
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.9);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const PanelTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const FilterWrap = styled.div`
  position: relative;
`;

const FilterBtn = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'};
  background: ${p => p.active ? `${Pista8Theme.primary}12` : 'transparent'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 16px;
  padding: 6px;
  z-index: 10;
  min-width: 160px;
  box-shadow: 0 12px 32px rgba(72,80,84,0.14);
  animation: ${fadeUp} 0.18s ease both;
`;

const FilterOption = styled.button<{ active: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${p => p.active ? '700' : '500'};
  color: ${p => p.active ? Pista8Theme.primary : Pista8Theme.secondary};
  background: ${p => p.active ? `${Pista8Theme.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(72,80,84,0.05); }
`;

const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ChallengeCard = styled.div<{ active: boolean }>`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid ${p => p.active ? Pista8Theme.primary : 'rgba(72,80,84,0.07)'};
  background: ${p => p.active ? `${Pista8Theme.primary}07` : 'rgba(248,249,250,0.8)'};
  cursor: pointer;
  transition: all 0.22s ease;
  overflow: hidden;
  &:hover {
    border-color: ${Pista8Theme.primary};
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(254,65,10,0.08);
  }
`;

const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: ${Pista8Theme.primary};
  border-radius: 0 4px 4px 0;
`;

const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const BadgeCorner = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 3px 8px;
  border-radius: 6px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}15;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const LikesChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a8b0b8;
  font-weight: 600;
  svg { color: #e8a0a0; }
`;

const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  line-height: 1.45;
`;

const CardMeta = styled.p`
  font-size: 12px;
  color: #b8c0c8;
  margin: 0;
  font-weight: 500;
`;

const RightPanel = styled.div<{ hasChallenge: boolean }>`
  background: ${Pista8Theme.secondary};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(72,80,84,0.1);
  opacity: ${p => p.hasChallenge ? 1 : 0.35};
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const StatsHeader = styled.div``;

const StatsTitle = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
`;

const StatsSub = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SummaryCard = styled.div`
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 12px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.18s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

const SummaryVal = styled.p`
  font-size: 30px;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
`;

const SummaryLabel = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StatsColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0 20px;
  flex: 1;
`;

const StatsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const ColLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px;
`;

const StatsDivider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.08);
  align-self: stretch;
`;

const RankRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 40px 28px;
  align-items: center;
  gap: 8px;
`;

const RankNum = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.25);
`;

const RankName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RankBar = styled.div`
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
`;

const RankFill = styled.div<{ pct: number; delay: number }>`
  height: 100%;
  width: ${p => p.pct}%;
  background: ${Pista8Theme.primary};
  border-radius: 2px;
  animation: ${fillBar} 0.55s ${p => p.delay}ms ease both;
`;

const RankVal = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-align: right;
`;

const EmptyStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default IdeationWall;