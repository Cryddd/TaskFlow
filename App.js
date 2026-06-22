import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskFlow() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={headerStyles.header}>
        <Text style={headerStyles.title}>TaskFlow</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter Task"
          placeholderTextColor="#9CA3AF"
        />
        <View style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.taskList}>
        <View style={styles.taskRow}>
          <MaterialIcons
            name="check-box-outline-blank"
            size={24}
            color="#4B5563"
          />
          <Text style={styles.taskText}>Study React Native</Text>
        </View>

        <View style={styles.taskRow}>
          <MaterialIcons
            name="check-box-outline-blank"
            size={24}
            color="#4B5563"
          />
          <Text style={styles.taskText}>Finish Assignment</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
});
