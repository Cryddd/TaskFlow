import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotes } from '../lib/hooks/useNotes';
import { colors, spacing } from '../lib/theme';
import { useScreenLoading } from '../lib/useScreenLoading';
import ScreenHeader from '../components/layout/ScreenHeader';
import NoteCard from '../components/ui/NoteCard';
import EmptyState from '../components/ui/EmptyState';
import { NotesGridSkeleton } from '../components/ui/SkeletonLoader';

export default function SeeAllNotesScreen() {
  const router = useRouter();
  const loading = useScreenLoading();
  const { data: notes = [], isLoading } = useNotes();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="All Notes" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading || isLoading ? (
          <NotesGridSkeleton count={6} />
        ) : notes.length === 0 ? (
          <EmptyState
            icon="sticky-note-2"
            title="No notes yet."
            ctaLabel="New Note"
            onCta={() => router.push('/note/new')}
          />
        ) : (
          <View style={styles.grid}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
