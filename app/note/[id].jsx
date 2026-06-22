import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotes, useNote, useCreateNote, useUpdateNote, useDeleteNote } from '../../lib/hooks/useNotes';
import { colors, fonts, spacing } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useScreenLoading } from '../../lib/useScreenLoading';
import ScreenHeader from '../../components/layout/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';
import { NoteEditorSkeleton } from '../../components/ui/SkeletonLoader';

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const loading = useScreenLoading();
  const isNew = id === 'new';
  const { data: notes = [] } = useNotes();
  const { data: fetchedNote, isLoading: noteLoading } = useNote(isNew ? null : id);
  const createNoteMut = useCreateNote();
  const updateNoteMut = useUpdateNote();
  const deleteNoteMut = useDeleteNote();
  const existing = !isNew ? (fetchedNote ?? notes.find((n) => n.id === id)) : null;

  const [noteId, setNoteId] = useState(existing?.id ?? null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lastEdited, setLastEdited] = useState(new Date().toISOString().split('T')[0]);
  const [saveStatus, setSaveStatus] = useState(null);
  const saveTimer = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (existing) {
      setNoteId(existing.id);
      setTitle(existing.title ?? '');
      setContent(existing.content ?? '');
      setLastEdited(existing.updatedAt ?? new Date().toISOString().split('T')[0]);
    }
  }, [existing?.id]);

  const persist = useCallback((nextTitle, nextContent) => {
    const payload = { title: nextTitle.trim() || 'Untitled', content: nextContent };
    if (noteId) {
      updateNoteMut.mutate({ id: noteId, updates: payload }, {
        onSuccess: () => {
          setLastEdited(new Date().toISOString().split('T')[0]);
          setSaveStatus('saved');
          showToast.noteSaved();
          setTimeout(() => setSaveStatus(null), 2000);
        },
      });
    } else if (nextTitle.trim() || nextContent.trim()) {
      createNoteMut.mutate(payload, {
        onSuccess: (data) => {
          setNoteId(data.id);
          setLastEdited(data.updatedAt);
          setSaveStatus('saved');
          showToast.noteSaved();
          setTimeout(() => setSaveStatus(null), 2000);
        },
      });
    }
  }, [noteId, createNoteMut, updateNoteMut]);

  const scheduleSave = useCallback((nextTitle, nextContent) => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(nextTitle, nextContent), 2000);
  }, [persist]);

  useEffect(() => {
    if (isNew) {
      setTimeout(() => titleRef.current?.focus(), 300);
    }
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [isNew]);

  if (loading || noteLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Note" />
        <NoteEditorSkeleton />
      </View>
    );
  }

  if (!isNew && !existing) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Note" />
        <EmptyState
          icon="sticky-note-2"
          title="Note not found"
          subtitle="It may have been deleted."
          ctaLabel="Back"
          onCta={() => router.back()}
        />
      </View>
    );
  }

  const handleTitleChange = (text) => {
    setTitle(text);
    scheduleSave(text, content);
  };

  const handleContentChange = (text) => {
    setContent(text);
    scheduleSave(title, text);
  };

  const handleDelete = () => {
    Alert.alert('Delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (noteId) {
            deleteNoteMut.mutate(noteId, {
              onSuccess: () => {
                showToast.noteDeleted();
                router.back();
              },
            });
          } else {
            router.back();
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${title}\n\n${content}` });
    } catch {
      // user cancelled
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title=""
        rightElement={
          <View style={styles.headerRight}>
            {saveStatus && (
              <Text style={styles.saveIndicator}>
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </Text>
            )}
            <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
              <MaterialIcons name="share" size={22} color={colors.gray[600]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <MaterialIcons name="delete" size={22} color={colors.danger[400]} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Note title"
          placeholderTextColor={colors.gray[400]}
        />
        <Text style={styles.timestamp}>Last edited {formatTimestamp(lastEdited)}</Text>
        <View style={styles.divider} />
        <TextInput
          style={styles.bodyInput}
          value={content}
          onChangeText={handleContentChange}
          placeholder="Start writing..."
          placeholderTextColor={colors.gray[400]}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 120, gap: 4 },
  headerBtn: { padding: 4 },
  saveIndicator: { fontSize: 11, fontFamily: fonts.regular, color: colors.gray[400], marginRight: 4 },
  scroll: { paddingHorizontal: spacing.screenH, paddingBottom: 40, flexGrow: 1 },
  titleInput: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 30,
    marginTop: 8,
    padding: 0,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: 16,
  },
  bodyInput: {
    flex: 1,
    minHeight: 300,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[700],
    lineHeight: 24,
    padding: 0,
  },
});
