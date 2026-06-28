import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { climateService } from '../../../domain/services/climate.service';

export interface CitySelection {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  longitude: number;
  latitude: number;
}

interface Props {
  value?: CitySelection | null;
  onChange: (data: CitySelection | null) => void;
  placeholder?: string;
}

export default function CitySelector({ value, onChange, placeholder = '请输入城市/区县' }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [cities, setCities] = useState<CitySelection[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setInputValue(`${value.district}（${value.province}）`);
    }
  }, [value]);

  const searchCities = useCallback(async (query: string) => {
    const keyword = query.trim();
    if (keyword.length < 1) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const results = await climateService.searchCities(keyword);
      setCities(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.warn('City search failed:', error);
      setCities([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setInputValue(text);
    onChange(null);
    searchCities(text);
  };

  const handleSelectCity = (city: CitySelection) => {
    setInputValue(`${city.district}（${city.province}）`);
    setShowDropdown(false);
    setCities([]);
    onChange(city);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
      {loading ? <Text style={styles.loadingText}>搜索中...</Text> : null}
      {showDropdown ? (
        <View style={styles.dropdown}>
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => handleSelectCity(item)}
              >
                <Text style={styles.cityName}>{item.district}（{item.province}）</Text>
                <Text style={styles.cityInfo}>{item.province} / {item.city}</Text>
              </TouchableOpacity>
            )}
            style={styles.cityList}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 220,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cityList: {
    maxHeight: 220,
  },
  cityItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cityInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
