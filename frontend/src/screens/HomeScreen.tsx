import React, { useState, useEffect, useMemo } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { createMovie, deleteMovie, listMovies, updateMovie, setToken } from '../api/movies';
import type { Movie, MoviePayload } from '../types/movie';

type FormState = {
  title: string;
  director: string;
  year: string;
  genre: string;
};

const initialForm: FormState = {
  title: '',
  director: '',
  year: '',
  genre: '',
};

type HomeScreenProps = {
  onLogout: () => void;
};

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  director: Yup.string().nullable(),
  year: Yup.number()
    .typeError('Year must be a number')
    .required('Year is required')
    .min(1888, 'Year must be >= 1888'),
  genre: Yup.string().nullable(),
});

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState<'year' | 'rating'>('year');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [modalVisible, setModalVisible] = useState(false);

  const modeTitle = useMemo(() => (editingId ? 'Edit Movie' : 'Add Movie'), [editingId]);

  async function fetchMovies() {
    setLoading(true);
    try {
      const data = await listMovies({
        q: q.trim() || undefined,
        genre: genre.trim() || undefined,
        sort,
        order,
      });
      setMovies(data);
      console.log('Read (List) operation successful. Fetched movies:', data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchMovies();
  }, [sort, order]);

  function loadForEdit(movie: Movie) {
    setEditingId(movie._id);
    setForm({
      title: movie.title ?? '',
      director: movie.director ?? '',
      year: movie.year ? String(movie.year) : '',
      genre: movie.genre ?? '',
    });
    setModalVisible(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSave(values: FormState) {
    setSaving(true);
    try {
      const payload: MoviePayload = {
        title: values.title.trim(),
        director: values.director.trim() || null,
        year: Number(values.year),
        genre: values.genre.trim() || null,
      };

      if (editingId) {
        await updateMovie(editingId, payload);
        console.log('Update operation successful. Payload fields:', payload);
      } else {
        await createMovie(payload);
        console.log('Create operation successful. Payload fields:', payload);
      }
      
      setModalVisible(false);
      resetForm();
      await fetchMovies();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, title: string) {
    Alert.alert('Delete movie', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMovie(id);
            console.log('Delete operation successful. Deleted movie ID:', id, 'Title:', title);
            if (editingId === id) resetForm();
            await fetchMovies();
          } catch (e) {
            console.error('Delete error:', e);
          }
        },
      },
    ]);
  }

  function handleLogout() {
    setToken(null);
    onLogout();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Movie Library</Text>
            <Text style={styles.sub}>Manage your collection</Text>
          </View>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Search / Filter / Sort</Text>
          <TextInput
            style={styles.input}
            placeholder="Search title or genre"
            placeholderTextColor="#8b8b8b"
            value={q}
            onChangeText={setQ}
          />
          <TextInput
            style={styles.input}
            placeholder="Genre filter"
            placeholderTextColor="#8b8b8b"
            value={genre}
            onChangeText={setGenre}
          />
          <View style={styles.row}>
            <Pressable style={styles.toggleBtn} onPress={() => setSort(sort === 'year' ? 'rating' : 'year')}>
              <Text style={styles.toggleText}>Sort: {sort}</Text>
            </Pressable>
            <Pressable style={styles.toggleBtn} onPress={() => setOrder(order === 'asc' ? 'desc' : 'asc')}>
              <Text style={styles.toggleText}>Order: {order}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.primaryBtn} onPress={() => void fetchMovies()}>
            <Text style={styles.primaryText}>Apply Filters</Text>
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color="#d4af37" size="large" style={{ marginVertical: 20 }} /> : null}

        <Text style={styles.sectionTitle}>Movies ({movies.length})</Text>
        {movies.length === 0 && !loading ? (
          <Text style={styles.meta}>No movies yet.</Text>
        ) : (
          movies.map((item) => (
            <View key={String(item._id)} style={styles.movieCard}>
              <Text style={styles.movieTitle}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.genre ?? 'Unknown genre'} • {item.year ?? 'No year'}
              </Text>
              <View style={styles.row}>
                <Pressable style={styles.secondaryBtn} onPress={() => loadForEdit(item)}>
                  <Text style={styles.secondaryText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => onDelete(item._id, item.title)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
        {/* Extra padding for ScrollView to not hide items behind FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Modal with Formik */}
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modeTitle}</Text>
            <Formik
              initialValues={form}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSave}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={{ gap: 12 }}>
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Title *"
                      placeholderTextColor="#8b8b8b"
                      onBlur={handleBlur('title')}
                      value={values.title}
                      onChangeText={handleChange('title')}
                    />
                    {touched.title && errors.title && (
                      <Text style={styles.fieldError}>{errors.title}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Director"
                      placeholderTextColor="#8b8b8b"
                      onBlur={handleBlur('director')}
                      value={values.director}
                      onChangeText={handleChange('director')}
                    />
                    {touched.director && errors.director && (
                      <Text style={styles.fieldError}>{errors.director}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Release year *"
                      placeholderTextColor="#8b8b8b"
                      keyboardType="number-pad"
                      onBlur={handleBlur('year')}
                      value={values.year}
                      onChangeText={handleChange('year')}
                    />
                    {touched.year && errors.year && (
                      <Text style={styles.fieldError}>{errors.year}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Genre"
                      placeholderTextColor="#8b8b8b"
                      onBlur={handleBlur('genre')}
                      value={values.genre}
                      onChangeText={handleChange('genre')}
                    />
                    {touched.genre && errors.genre && (
                      <Text style={styles.fieldError}>{errors.genre}</Text>
                    )}
                  </View>

                  <View style={[styles.row, { marginTop: 10 }]}>
                    <Pressable 
                      style={[styles.primaryBtn, { flex: 1 }]} 
                      onPress={() => handleSubmit()} 
                      disabled={saving}
                    >
                      <Text style={styles.primaryText}>
                        {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                      </Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.secondaryBtn, { flex: 1 }, { alignItems: 'center' }]} 
                      onPress={() => {
                        setModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.secondaryText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.7}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <AntDesign name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0e0e0e' },
  container: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heading: { color: '#d4af37', fontSize: 32, fontWeight: '700' },
  sub: { color: '#b1b1b1', fontSize: 14 },
  logoutBtn: { backgroundColor: '#242424', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#161616',
    gap: 12,
  },
  sectionTitle: { color: '#f2f2f2', fontSize: 18, fontWeight: '700', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: '#101010',
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryBtn: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    backgroundColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#404040',
  },
  secondaryText: { color: '#d4af37', fontWeight: '700' },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  toggleText: { color: '#f4f4f4', fontSize: 14 },
  movieCard: {
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#161616',
    gap: 8,
  },
  movieTitle: { color: '#fff', fontSize: 19, fontWeight: '700' },
  meta: { color: '#c2c2c2', fontSize: 14 },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#7d1d1d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2a1212',
  },
  deleteText: { color: '#ff9090', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  modalTitle: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldError: {
    color: '#ff7f7f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#b91c1c',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
