 import { useRouter } from 'expo-router';
import { updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db, storage } from '../firebaseconfig';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


export default function EditProfileVendor() {
  const router = useRouter();
  const user = auth.currentUser;
  const uid = user?.uid;
 
  const [imageUri, setImageUri] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profilePics/${uid}-${uuid.v4()}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const [data, setData] = useState({
    fullName: '',
    email: '',
    farmName: '',
    experience: '',
    location: '',
    category: '',
    products: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setData({
          fullName: d.fullName || '',
          email: d.email || user?.email || '',
          farmName: d.farmName || '',
          experience: d.experience || '',
          location: d.location || '',
          category: d.category || '',
          products: d.products?.join(', ') || '',
        });
        if (d.photoURL) setImageUri(d.photoURL);
      }
    });
  }, [uid]);

  const saveChanges = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      let photoURL = '';
      if (imageUri && !imageUri.startsWith('https://')) {
        setUploading(true);
        photoURL = await uploadImageAsync(imageUri);
        setUploading(false);
      }

      await updateDoc(doc(db, 'users', uid!), {
        farmName: data.farmName,
        experience: data.experience,
        location: data.location,
        category: data.category,
        products: data.products.split(',').map(p => p.trim()),
        ...(photoURL && { photoURL }),
      });

      if (newPassword.trim().length > 0) {
        await updatePassword(user!, newPassword);
      }

      Alert.alert('Profile Updated');
      router.replace('/VendorProfile');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Vendor Profile</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imageText}>Upload Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} value={data.fullName} editable={false} />
      <TextInput style={styles.input} value={data.email} editable={false} />

      <TextInput
        style={styles.input}
        placeholder="Farm Name"
        value={data.farmName}
        onChangeText={(t) => setData({ ...data, farmName: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Experience (e.g. 15 years)"
        value={data.experience}
        onChangeText={(t) => setData({ ...data, experience: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Farm Location"
        value={data.location}
        onChangeText={(t) => setData({ ...data, location: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Vegetables)"
        value={data.category}
        onChangeText={(t) => setData({ ...data, category: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Available Products (comma separated)"
        value={data.products}
        onChangeText={(t) => setData({ ...data, products: t })}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
        <Text style={styles.saveText}>{uploading ? 'Uploading...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageText: {
    color: '#555',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
