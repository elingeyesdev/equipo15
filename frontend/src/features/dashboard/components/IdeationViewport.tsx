import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import SkyCanvas from '../../../features/sky-wall';
import * as S from '../styles/LayoutStyles';
import { CategoryTag } from '../styles/ChallengeStyles';
import ChallengeList from './ChallengeList';
import StatsPanel from './StatsPanel';
import OmniSearchBar from './OmniSearchBar';
import IdeasChronologicalList from './IdeasChronologicalList';
import InnovationStepsPanel from './InnovationStepsPanel';
import PenaltyBanner from '../../../components/common/PenaltyBanner';
import Pista8Logo from '../../../components/icons/Pista8Logo';
import AdvancedFilter from './AdvancedFilter';
import InfoTooltip from '../../../components/common/InfoTooltip';
import { NotificationBell } from '../../../components/common/NotificationBell';
import type { AdvancedFilterState } from './AdvancedFilter';
import type { RawIdea } from '../../../features/sky-wall/types';
import type { Challenge } from '../../../types/models';
import { resolveDisplayName } from '../../../utils/user.utils';
import { getFacultyName } from '../../../config/faculties';

interface IdeationViewportProps {
  ds: any;
  showAllIdeas: boolean;
  setShowAllIdeas: (v: boolean) => void;
  displayedWallIdeas: RawIdea[];
  listLoading: boolean;
  advFilter: AdvancedFilterState;
  setAdvFilter: (v: AdvancedFilterState) => void;
  highlightedIdeaId: string | null;
  handleSelectIdea: (idea: any) => void;
  handleHighlightIdea: (idea: any) => void;
  handleIdeasLoaded: (ideas: RawIdea[]) => void;
  formResetForm: () => void;
}

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const CalendarSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const getStatusLabel = (status?: string): { label: string; active: boolean } => {
  if (!status) return { label: 'Sin estado', active: false };
  const s = status.toLowerCase();
  if (s === 'activo' || s === 'active' || s === 'published') return { label: 'Activo', active: true };
  if (s === 'finalizado' || s === 'finished' || s === 'closed') return { label: 'Finalizado', active: false };
  if (s === 'en evaluación' || s === 'evaluating') return { label: 'En Evaluación', active: false };
  if (s === 'borrador' || s === 'draft') return { label: 'Borrador', active: false };
  return { label: status, active: false };
};

const IdeationViewport: React.FC<IdeationViewportProps> = ({
  ds,
  showAllIdeas,
  setShowAllIdeas,
  displayedWallIdeas,
  listLoading,
  advFilter,
  setAdvFilter,
  highlightedIdeaId,
  handleSelectIdea,
  handleHighlightIdea,
  handleIdeasLoaded,
  formResetForm,
}) => {
  const { userProfile } = useAuth();
  if (handleHighlightIdea as any === 'dummy') {
    handleHighlightIdea(null);
  }

  const resolvedName = resolveDisplayName(userProfile as any);

  const challengeStatus = ds.selectedChallenge ? getStatusLabel(ds.selectedChallenge.status) : null;
  const facultyLabel = ds.selectedChallenge
    ? (() => {
        const facs = (ds.selectedChallenge as any).faculties;
        if (Array.isArray(facs) && facs.length > 0) {
          return facs.map((f: any) => f.name.replace(/^Facultad de /i, '')).join(', ');
        }
        return ds.selectedChallenge.facultyId
          ? getFacultyName(ds.selectedChallenge.facultyId, ds.selectedChallenge.faculty?.name)
          : 'Todas las Facultades';
      })()
    : null;

  const visibleLimit = (!showAllIdeas && displayedWallIdeas && displayedWallIdeas.length > 0)
    ? Math.min(displayedWallIdeas.length, 2)
    : 2;

  return (
    <S.Page>
      <div style={{ marginBottom: '16px' }}>
        <PenaltyBanner />
      </div>
      <S.Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Pista8Logo fill="#1a1f22" accent="#FE410A" />
          <S.WelcomeZone>
            <S.Greeting>Hola, <span>{resolvedName}</span></S.Greeting>
            <S.Sub>¿Listo para hacer despegar vos también tu gran idea?</S.Sub>

            {ds.profileError && (
              <div style={{
                margin: '12px 0 0',
                padding: '8px 16px',
                background: '#fff5f5',
                color: '#e53e3e',
                borderRadius: '8px',
                fontSize: '12px',
                border: '1px solid #feb2b2',
                fontWeight: '600'
              }}>
                {ds.profileError}
              </div>
            )}
          </S.WelcomeZone>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <OmniSearchBar
            value={ds.searchQuery}
            onChange={ds.setSearchQuery}
          />
          <NotificationBell />
          <S.HamburgerBtn onClick={() => ds.setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" />
            </svg>
          </S.HamburgerBtn>
        </div>
      </S.Header>

      {ds.selectedChallenge ? (
        <>
          <S.ChallengeDetailCard id="challenge-detail" as={motion.div} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <S.DetailCardBody>
              <S.DetailBadgeRow style={{ flexDirection: 'column', gap: '12px', width: '100%' }}>
                {facultyLabel && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {facultyLabel.split(',').map((cat: string, idx: number) => (
                      <CategoryTag key={idx} style={{ padding: '6px 12px', fontSize: '11px' }}>{cat.trim()}</CategoryTag>
                    ))}
                  </div>
                )}
                {challengeStatus && (
                  <S.DetailStatusBadge $active={challengeStatus.active}>
                    {challengeStatus.label}
                  </S.DetailStatusBadge>
                )}
              </S.DetailBadgeRow>
              <S.DetailTitle>{ds.selectedChallenge.title}</S.DetailTitle>
              {ds.selectedChallenge.problemDescription && (
                <S.DetailDescription>{ds.selectedChallenge.problemDescription}</S.DetailDescription>
              )}
              <S.DetailMeta>
                <S.DetailMetaItem>
                  <CalendarSvg />
                  {formatDate(ds.selectedChallenge.startDate || ds.selectedChallenge.submissionsOpenAt)} — {formatDate(ds.selectedChallenge.endDate || ds.selectedChallenge.submissionsCloseAt)}
                </S.DetailMetaItem>
              </S.DetailMeta>
            </S.DetailCardBody>
            <S.DetailActions>
              {ds.selectedChallenge.status === 'CLOSED' ? (
                <div style={{ 
                  padding: '12px 18px', 
                  background: 'linear-gradient(135deg, #fcfcfc 0%, #f7f9fa 100%)', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(72, 80, 84, 0.12)', 
                  borderLeft: '4px solid #FE410A', 
                  color: '#475569', 
                  fontSize: '13.5px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  letterSpacing: '0.2px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FE410A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Reto finalizado: modo lectura histórica
                </div>
              ) : (
                <>
                  <S.RespondBtn onClick={() => ds.handleOpenForm(ds.selectedChallenge, formResetForm)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Responder Reto
                  </S.RespondBtn>
                  <InfoTooltip text="Envia tu idea para este reto. Detalla el problema que resuelves y tu propuesta de solucion." size={20} />
                </>
              )}
            </S.DetailActions>
          </S.ChallengeDetailCard>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: '24px 0 14px', padding: '0 24px', flexWrap: 'wrap', gap: '8px' }}>
            <AdvancedFilter
              value={advFilter}
              onChange={next => {
                if (next.sortOrder !== advFilter.sortOrder) {
                  ds.setSortOrder(next.sortOrder);
                }
                setAdvFilter(next);
              }}
              disabled={!ds.selectedChallenge}
              challengeStatus={ds.selectedChallenge?.status}
            />
          </div>

          <div id="ideation-wall" style={{ position: 'relative' }}>

            <SkyCanvas
              challengeId={ds.selectedChallenge?.id}
              challengeTitle={ds.selectedChallenge?.title}
              challengeFacultyId={ds.selectedChallenge?.facultyId ?? undefined}
              isDashboardLoading={ds.loading}
              search={ds.debouncedSearch}
              sort={advFilter.sortOrder ?? undefined}
              challengeStatus={ds.selectedChallenge?.status}
              onIdeasLoaded={handleIdeasLoaded}
              onlyFavorites={advFilter.onlyFavorites}
              topLimit={advFilter.topLimit}
              facultyId={advFilter.facultyId}
              highlightedIdeaId={highlightedIdeaId}
              onlyMyIdeas={advFilter.onlyMyIdeas}
              currentUserId={(userProfile as any)?.id}
            />
          </div>

          {!showAllIdeas ? (
            <>
              <S.SplitGrid style={{ marginTop: '24px', alignItems: 'stretch', height: visibleLimit === 1 ? '480px' : '750px' }}>
                {ds.sortOrder && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <IdeasChronologicalList
                      ideas={displayedWallIdeas}
                      sortOrder={ds.sortOrder}
                      isLoading={listLoading}
                      onSelectIdea={handleSelectIdea}
                      showAll={showAllIdeas}
                      onToggleShowAll={() => setShowAllIdeas(!showAllIdeas)}
                      challengeStatus={ds.selectedChallenge?.status}
                    />
                  </div>
                )}
                <div style={{ height: '100%' }}>
                  <ChallengeList
                    loading={ds.loading}
                    challenges={ds.challenges}
                    activeFilter={ds.activeFilter}
                    onFilterChange={ds.setActiveFilter}
                    filterOpen={ds.filterOpen}
                    setFilterOpen={ds.setFilterOpen}
                    selectedChallengeId={ds.selectedChallenge?.id || ''}
                    onSelectChallenge={ds.selectChallenge}
                    onRespond={(c: Challenge) => ds.handleOpenForm(c, formResetForm)}
                    onClearSelection={ds.clearSelectedChallenge}
                    searchQuery={ds.debouncedSearch}
                    userFacultyId={userProfile?.facultyId}
                    forceColumn
                    visibleChallengesLimit={visibleLimit}
                  />
                </div>
              </S.SplitGrid>


              <StatsPanel
                selectedChallenge={ds.selectedChallenge}
                challengeStats={ds.challengeStats}
                onSelectIdea={handleSelectIdea}
                style={{ marginTop: 32 }}
                isNarrow={false}
              />
            </>
          ) : (
            <>
              <S.FullWidthContainer style={{ marginTop: '24px' }}>
                {ds.sortOrder && (
                  <IdeasChronologicalList
                    ideas={displayedWallIdeas}
                    sortOrder={ds.sortOrder}
                    isLoading={listLoading}
                    onSelectIdea={handleSelectIdea}
                    showAll={showAllIdeas}
                    onToggleShowAll={() => setShowAllIdeas(!showAllIdeas)}
                    challengeStatus={ds.selectedChallenge?.status}
                  />
                )}
              </S.FullWidthContainer>

              <S.SplitGrid style={{ marginTop: '24px', alignItems: 'stretch' }}>
                <ChallengeList
                    loading={ds.loading}
                    challenges={ds.challenges}
                    activeFilter={ds.activeFilter}
                    onFilterChange={ds.setActiveFilter}
                    filterOpen={ds.filterOpen}
                    setFilterOpen={ds.setFilterOpen}
                    selectedChallengeId={ds.selectedChallenge?.id || ''}
                    onSelectChallenge={ds.selectChallenge}
                    onRespond={(c: Challenge) => ds.handleOpenForm(c, formResetForm)}
                    onClearSelection={ds.clearSelectedChallenge}
                    searchQuery={ds.debouncedSearch}
                    userFacultyId={userProfile?.facultyId}
                    forceColumn
                    visibleChallengesLimit={4}
                  />
                <StatsPanel
                  selectedChallenge={ds.selectedChallenge}
                  challengeStats={ds.challengeStats}
                  onSelectIdea={handleSelectIdea}
                  style={{ marginTop: 0 }}
                  isNarrow={false}
                />
              </S.SplitGrid>
            </>
          )}
        </>
      ) : (
        <S.SplitGrid>
          <div>
            <InnovationStepsPanel />
          </div>
          <div>
            <ChallengeList
              loading={ds.loading}
              challenges={ds.challenges}
              activeFilter={ds.activeFilter}
              onFilterChange={ds.setActiveFilter}
              filterOpen={ds.filterOpen}
              setFilterOpen={ds.setFilterOpen}
              selectedChallengeId={ds.selectedChallenge?.id || ''}
              onSelectChallenge={ds.selectChallenge}
              onRespond={(c: Challenge) => ds.handleOpenForm(c, formResetForm)}
              onClearSelection={ds.clearSelectedChallenge}
              searchQuery={ds.debouncedSearch}
              userFacultyId={userProfile?.facultyId}
              forceColumn
              visibleChallengesLimit={visibleLimit}
            />
          </div>
        </S.SplitGrid>
      )}
    </S.Page>
  );
};

export default IdeationViewport;