import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../lib/theme';

export default function NoteCard({ note, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{note.content}</Text>
      {note.tags?.length > 0 && (
        <View style={styles.tags}>
          {note.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
    ...shadows.card,
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 18,
  },
  content: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.primary[800],
    lineHeight: 14,
  },
});
