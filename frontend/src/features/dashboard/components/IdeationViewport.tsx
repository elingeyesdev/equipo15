import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import SkyCanvas from '../../../features/sky-wall';
import * as S from '../styles/LayoutStyles';
import ChallengeList from './ChallengeList';
import StatsPanel from './StatsPanel';
import OmniSearchBar from './OmniSearchBar';
import IdeasChronologicalList from './IdeasChronologicalList';
import InnovationStepsPanel from './InnovationStepsPanel';
import PenaltyBanner from '../../../components/common/PenaltyBanner';
import Pista8Logo from '../../../components/icons/Pista8Logo';
import AdvancedFilter from './AdvancedFilter';
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
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CalendarSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const getStatusLabel = (status?: string): { label: string; active: boolean } => {
  if (!status) return { label: 'Sin estado', active: false };
  const s = status.toLowerCase();
  if (s === 'activo' || s === 'active') return { label: 'Activo', active: true };
  if (s === 'finalizado' || s === 'finished') return { label: 'Finalizado', active: false };
  if (s === 'en evaluación') return { label: 'En Evaluación', active: false };
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

  const resolvedName = resolveDisplayName(userProfile as any);
  const roleName: string = (userProfile?.roleInfo?.name || userProfile?.role || '').toLowerCase();
  const roleLabels: Record<string, string> = {
    admin: 'administrador',
    student: 'estudiante',
    company: 'empresa',
    judge: 'jurado',
  };
  const userRole = roleLabels[roleName] || 'participante';

  const challengeStatus = ds.selectedChallenge ? getStatusLabel(ds.selectedChallenge.status) : null;
  const facultyLabel = ds.selectedChallenge
    ? (ds.selectedChallenge.facultyId
        ? getFacultyName(ds.selectedChallenge.facultyId, ds.selectedChallenge.faculty?.name)
        : 'Todas las Facultades')
    : null;

  return (
    <S.Page>
      <div style={{ marginBottom: '16px' }}>
        <PenaltyBanner />
      </div>
      <S.Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Pista8Logo fill="#1a1f22" accent="#FE410A" />
          <S.WelcomeZone>
            <S.Greeting>Hola, {userRole} <span>{resolvedName}</span></S.Greeting>
            <S.Sub>¿Listo para despegar tu próxima gran idea?</S.Sub>

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
              <S.DetailBadgeRow>
                {facultyLabel && (
                  <S.DetailFaculty>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    {facultyLabel}
                  </S.DetailFaculty>
                )}
                {challengeStatus && (
                  <S.DetailStatusBadge $active={challengeStatus.active}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'currentColor',
                      display: 'inline-block',
                    }} />
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
                  {formatDate(ds.selectedChallenge.startDate)} — {formatDate(ds.selectedChallenge.endDate)}
                </S.DetailMetaItem>
              </S.DetailMeta>
            </S.DetailCardBody>
            <S.DetailActions>
              <S.RespondBtn onClick={() => ds.handleOpenForm(ds.selectedChallenge, formResetForm)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Responder Reto
              </S.RespondBtn>
            </S.DetailActions>
          </S.ChallengeDetailCard>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: '24px 0 14px', flexWrap: 'wrap', gap: '8px' }}>
            <AdvancedFilter
              value={advFilter}
              onChange={next => {
                if (next.sortOrder !== advFilter.sortOrder) {
                  ds.setSortOrder(next.sortOrder);
                }
                setAdvFilter(next);
              }}
              disabled={!ds.selectedChallenge}
            />
          </div>

          <div id="ideation-wall">
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
          />
          </div>

          {!showAllIdeas ? (
            <>
              <S.SplitGrid as={motion.div} layout style={{ marginTop: '24px' }}>
                {ds.sortOrder && (
                  <motion.div layout>
                    <IdeasChronologicalList
                      ideas={displayedWallIdeas}
                      sortOrder={ds.sortOrder}
                      isLoading={listLoading}
                      onSelectIdea={handleSelectIdea}
                      showAll={showAllIdeas}
                      onToggleShowAll={() => setShowAllIdeas(!showAllIdeas)}
                    />
                  </motion.div>
                )}
                <motion.div layout>
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
                  />
                </motion.div>
              </S.SplitGrid>

              <StatsPanel
                selectedChallenge={ds.selectedChallenge}
                challengeStats={ds.challengeStats}
                onSelectIdea={handleHighlightIdea}
                style={{ marginTop: 32 }}
              />
            </>
          ) : (
            <>
              <S.FullWidthContainer as={motion.div} layout style={{ marginTop: '24px' }}>
                {ds.sortOrder && (
                  <IdeasChronologicalList
                    ideas={displayedWallIdeas}
                    sortOrder={ds.sortOrder}
                    isLoading={listLoading}
                    onSelectIdea={handleSelectIdea}
                    showAll={showAllIdeas}
                    onToggleShowAll={() => setShowAllIdeas(!showAllIdeas)}
                  />
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <S.RespondBtn onClick={() => {
                    const el = document.getElementById('challenge-detail');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Participar
                  </S.RespondBtn>
                </div>
              </S.FullWidthContainer>

              <S.SplitGridEqual as={motion.div} layout style={{ marginTop: '24px' }}>
                <motion.div layout style={{ display: 'flex', flexDirection: 'column' }}>
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
                  />
                </motion.div>
                <motion.div layout style={{ display: 'flex', flexDirection: 'column' }}>
                  <StatsPanel
                    selectedChallenge={ds.selectedChallenge}
                    challengeStats={ds.challengeStats}
                    onSelectIdea={handleHighlightIdea}
                  />
                </motion.div>
              </S.SplitGridEqual>
            </>
          )}
        </>
      ) : (
        <S.SplitGrid as={motion.div} layout>
          <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <InnovationStepsPanel />
          </motion.div>
          <motion.div layout>
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
            />
          </motion.div>
        </S.SplitGrid>
      )}
    </S.Page>
  );
};

export default IdeationViewport;