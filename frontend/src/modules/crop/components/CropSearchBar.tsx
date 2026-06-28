import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  filterCount: number;
  onOpenFilter: () => void;
}

export default function CropSearchBar({ searchText, onSearchTextChange, filterCount, onOpenFilter }: Props) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索作物..."
          value={searchText}
          onChangeText={onSearchTextChange}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => onSearchTextChange('')}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onOpenFilter}>
        <Ionicons name="filter" size={18} color="#666" style={styles.filterIcon} />
        <Text style={styles.filterText}>
          {filterCount > 0 ? `已筛选 ${filterCount}` : '筛选'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterIcon: {
    marginRight: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
